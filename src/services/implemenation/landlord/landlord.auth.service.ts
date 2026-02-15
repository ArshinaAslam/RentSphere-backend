
import { injectable , inject } from "tsyringe";
import { DI_TYPES } from "../../../common/di/types";
import { ITenantRepository } from "../../../repositories/interface/tenant/ITenantRepository";
import bcrypt from 'bcryptjs'
import { HttpStatus } from "../../../common/enums/httpStatus.enum"
import { MESSAGES } from "../../../common/constants/statusMessages";
import { AppError } from "../../../common/errors/appError";
import { IRedisService } from "../../interface/IRedisService";
import { IEmailService } from "../../interface/IEmailService";
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library'


import logger from "../../../utils/logger";


import { ENV } from "../../../config/env";
import { ITenant, UserRole } from "../../../models/tenantModel";


import { ILandlord } from "../../../models/landlordModel";
import { ILandlordRepository } from "../../../repositories/interface/landlord/ILandlordRepository";


import { uploadToS3 } from "../../../config/s3";
import { forgotPasswordDto, getKycStatusDto, LandlordLoginDto, LandlordSignupDto, resendOtpDto, resetPasswordDto, SubmitLandlordKycDto, verifyOtpDto } from "../../../dto/landlord/landlord.auth.dto";

import { ILandlordAuthService, KycResult, LandlordLoginResult, LandlordSignupResult, verifyLandlordOtpResult } from "../../interface/landlord/ILandlordAuthService";



function validateAadhaar(number: string): void {
  if (!/^\d{12}$/.test(number)) {
    throw new AppError('Invalid Aadhaar format', 400);
  }
}

function validatePan(number: string): void {
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(number)) {
    throw new AppError('Invalid PAN format', 400);
  }
}



@injectable()
export class LandlordAuthService implements ILandlordAuthService{
  constructor(
    @inject(DI_TYPES.RedisService)
    private readonly _redisService: IRedisService,
    @inject(DI_TYPES.EmailService)
    private readonly _emailService:IEmailService,
    @inject(DI_TYPES.LandlordRepository)
    private readonly _landlordRepo : ILandlordRepository,
     ){}

 
     






async googleAuth({ token, role }: { token: string; role: string }): Promise<LandlordLoginResult> {
 logger.info('Google OAuth processing', { role });
  const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: ENV.GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload();
  logger.warn('Google OAuth failed - invalid token', { role });
  if (!payload ) {
    throw new AppError('Invalid Google token', HttpStatus.UNAUTHORIZED);
  }

  const { email, given_name: firstName='', family_name: lastName='', picture: avatar, sub: googleId } = payload;


  if (!email) {
    logger.warn('Google OAuth failed - no email', { role, googleId: googleId?.substring(0, 8) });
  throw new AppError('Google account must have an email associated', HttpStatus.BAD_REQUEST);
}
  
  logger.debug('Google user data', { email, role, googleId: googleId?.substring(0, 8) });
  

  let user = await this._landlordRepo.findByEmail(email);

  
  if (!user) {
     logger.info('Google OAuth - creating new user', { email, role });
    const newUserData : Partial<ITenant>  = {
      firstName:firstName || 'User',
      lastName:lastName || '',
      email,
      role:role as UserRole,
      avatar: avatar || '',
      googleId,
      isEmailVerified: true,
      isActive: true,
      phone: '',
     
    };
    
    logger.info('Google user created', { email, role });
    user = await this._landlordRepo.create(newUserData);
  }


  const existingUser = await this._landlordRepo.findByEmail(email);

  if (existingUser && existingUser.role !== role) {
     logger.warn('Google OAuth blocked - role conflict', { email, requestedRole: role, existingRole: existingUser.role });
    throw new AppError('Email already registered with different role', HttpStatus.CONFLICT);
  }


  
  const payloadJwt = { userId: user._id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payloadJwt, ENV.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payloadJwt, ENV.JWT_REFRESH_SECRET, { expiresIn: '7d' });


 logger.info('Google OAuth complete - tokens generated', { 
    userId: user._id,
    email: user.email,
    role: user.role 
  });

  return {
    user: { 
      id: user._id.toString(), 
      email: user.email, 
      role: user.role,
      fullName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || '',
      phone : user.phone
    },
    tokens: { accessToken, refreshToken }
  };
}


     async landlordSignup(dto: LandlordSignupDto): Promise<LandlordSignupResult> {
       logger.info('Landlord signup processing', { email: dto.email });
  
         const existing = await this._landlordRepo.findByEmail(dto.email)
  if (existing?.isEmailVerified) {
    logger.warn('Landlord signup blocked - email exists', { email: dto.email });
    throw new AppError(MESSAGES.AUTH.EMAIL_EXISTS, HttpStatus.CONFLICT);
  }

  const passwordHash = await bcrypt.hash(dto.password, 10);
  const landlord = await this._landlordRepo.create({  
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone,
    passwordHash,
    role : dto.role,
    kycStatus: "PENDING"  
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
   logger.debug('Landlord OTP generated', { 
    email: dto.email, 
     
  });
  await this._redisService.setOtp(landlord.email, otp);
  console.log(`OTP ${otp} sent to ${landlord.email}`);
  await this._redisService.setResendLock(landlord.email);
  await this._emailService.sendOtpEmail(landlord.email, otp);
  

  logger.info('Landlord signup complete', { 
    email: landlord.email, 
    userId: landlord._id,
    kycStatus: 'PENDING' 
  });

  return { email: landlord.email, otpSent: true };
}



    


     async verifyLandlordOtp(dto:verifyOtpDto): Promise<verifyLandlordOtpResult> {
      logger.info('Lnadord OTP verification', { email: dto.email });
  const storedOtp = await this._redisService.getOtp(dto.email);
  if (!storedOtp) {
    logger.warn('Landlord OTP verification failed - expired', { email: dto.email });
    throw new AppError("OTP Expired", HttpStatus.BAD_REQUEST);
  }
  if (storedOtp !== dto.otp) {
      logger.warn('Landlord OTP verification failed - invalid', { 
        email: dto.email,
        providedOtp: dto.otp.substring(0, 3) + '***',
        storedOtp: storedOtp.substring(0, 3) + '***'
      });
    throw new AppError("Invalid OTP", HttpStatus.BAD_REQUEST);
  }

  await this._redisService.deleteOtp(dto.email);
  await this._landlordRepo.updateByEmail(dto.email, { 
    isEmailVerified: true, 
    
  });

  const landlord = await this._landlordRepo.findByEmail(dto.email)
  if (!landlord) throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
logger.info('Landlord OTP verified successfully', { email: dto.email });
  return {
    fullName: `${landlord.firstName} ${landlord.lastName}`,
   
    email: landlord.email,
    phone: landlord.phone,
  }
}







async resendLandlordOtp(dto: resendOtpDto): Promise<{ success: boolean }> {
  logger.info('OTP resend request', { email: dto.email });

 
  let existing = await this._landlordRepo.findByEmail(dto.email);
  
  

  if (!existing) {
    logger.warn('OTP resend failed - user not found', { email: dto.email });
    throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
  }

  
  const canResend = await this._redisService.canResendOtp(dto.email);
  if (!canResend) {
    logger.warn('OTP resend blocked - rate limited', { email: dto.email });
    throw new AppError("Please wait before requesting new OTP", HttpStatus.TOO_MANY_REQUESTS);
  }

 
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  logger.debug('OTP regenerated for resend', { 
    email: dto.email,
    otpMasked: otp.substring(0, 3) + '***' 
  });

  await this._redisService.setOtp(dto.email, otp);
  await this._redisService.setResendLock(dto.email);
  
  console.log(`OTP ${otp} resend to ${dto.email}`);

  
  await this._emailService.sendOtpEmail(dto.email, otp);
  
  logger.info('OTP resend success', { email: dto.email, role: existing.role });
  return { success: true };
}



async submitKyc(email: string, dto: SubmitLandlordKycDto): Promise<KycResult> {
   console.log("reached kyc service1")

     const user = await this._landlordRepo.findByEmail(email);
     if (!user) {
      

       throw new AppError('Landlord not found for this email',HttpStatus.NOT_FOUND)
     }
   
     const userId = user._id.toString();
     console.log("Found userId:", userId);
  
  const { aadhaarFront, panCard, aadhaarBack, selfie } = dto.files;

 
  const [aadhaarFrontUrl, panCardUrl, aadhaarBackUrl, selfieUrl] = await Promise.all([
    uploadToS3(aadhaarFront!, 'kyc/aadhaar', userId),
    uploadToS3(panCard!, 'kyc/pan', userId),
    aadhaarBack ? uploadToS3(aadhaarBack, 'kyc/aadhaar', userId) : Promise.resolve(''),
    selfie ? uploadToS3(selfie, 'kyc/selfie', userId) : Promise.resolve(''),
  ]);

  
  validateAadhaar(dto.aadhaarNumber);
  validatePan(dto.panNumber);

  
  const dbData: Partial<ILandlord> = {
    kycStatus: 'PENDING',
    kycDetails: {
      aadhaarNumber: dto.aadhaarNumber,
      panNumber: dto.panNumber,
    },
 kycDocuments: {
    aadhaarFront: aadhaarFrontUrl!,        
    aadhaarBack: aadhaarBackUrl || '',     
    panCard: panCardUrl!,                  
    liveSelfie: selfieUrl || '',           
  },
    kycSubmittedAt: new Date(),
  };

 
  const landlord = await this._landlordRepo.updateKyc(userId, dbData);
  if (!landlord) throw new AppError('Landlord not found', 404);
 console.log("reached kyc service2",landlord._id.toString())
  
  return { kycId: landlord._id.toString() ,kycStatus:landlord.kycStatus!, kycRejectedReason: landlord.kycRejectedReason || null};
}

async getKycStatus(dto: getKycStatusDto): Promise<KycResult> {
  console.log("check11")
  logger.info('Fetching KYC status for email', { email: dto.email });

  const landlord = await this._landlordRepo.findByEmail(dto.email);
  if (!landlord) {
    logger.warn('KYC status failed - landlord not found', { email: dto.email });
    throw new AppError('Landlord not found for this email', HttpStatus.NOT_FOUND);
  }

  logger.debug('KYC status found', {
    email: dto.email,
    kycId: landlord._id.toString(),
    kycStatus: landlord.kycStatus || 'PENDING'
  });

  const result = {
    kycId: landlord._id.toString(),
    kycStatus: landlord.kycStatus as 'PENDING' | 'APPROVED' | 'REJECTED' || 'PENDING',
    kycRejectedReason: landlord.kycRejectedReason || null,
   
  };
   
  logger.info('KYC status returned successfully', { 
    kycId: result.kycId, 
    kycStatus: result.kycStatus 
  });
console.log("check12")
  return result;
}








async landlordLogin(dto: LandlordLoginDto): Promise<LandlordLoginResult> {  
  logger.info('Landlord login validation', { email: dto.email });


  const landlord = await this._landlordRepo.findByEmail(dto.email);
  if (!landlord) {
    logger.warn('Login failed - landlord not found', { email: dto.email });
    throw new AppError('Email not exist', HttpStatus.UNAUTHORIZED);
  }

  if (!landlord.isEmailVerified) {
    logger.warn('Login failed - unverified landlord', { email: dto.email });
    throw new AppError('Email is not verified', HttpStatus.UNAUTHORIZED);
  }

  if (!landlord.isActive) {
    logger.warn('Login failed - inactive landlord', { email: dto.email });
    throw new AppError('Email is inactive', HttpStatus.UNAUTHORIZED);
  }

  const isValidPassword = await bcrypt.compare(dto.password, landlord.passwordHash);
  if (!isValidPassword) {
    logger.warn('Login failed - wrong password', { email: dto.email });
    throw new AppError('Password is incorrect', HttpStatus.UNAUTHORIZED);
  }

  
  const payload = { 
    userId: landlord._id, 
    email: landlord.email, 
    role: 'LANDLORD'  
  };
  
  const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  logger.info('Landlord login success', { userId: landlord._id, email: landlord.email });
  
  return {
    user: { 
      id: landlord._id.toString(), 
      email: landlord.email, 
      role: landlord.role || 'LANDLORD',
      fullName: `${landlord.firstName} ${landlord.lastName}`,
      phone: landlord.phone,
     aadharNumber:landlord.kycDetails?.aadhaarNumber || '',
    panNumber:landlord.kycDetails?.panNumber || '',
    aadharFrontUrl: landlord.kycDocuments?.aadhaarFront || '',
    aadharBackUrl: landlord.kycDocuments?.aadhaarBack|| '',
    panFrontUrl: landlord.kycDocuments?.panCard || ''
      
    },
    tokens: { accessToken, refreshToken }
  };
}







async resetLandlordPassword(dto: resetPasswordDto): Promise<{ success: boolean }> {
  logger.info('Password reset processing', { email: dto.email });

 
  let landlord = await this._landlordRepo.findByEmail(dto.email);
 

  if (!landlord) {
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }

  
  const isSameAsOldPassword = await bcrypt.compare(dto.newPassword, landlord.passwordHash);
  if (isSameAsOldPassword) {
    throw new AppError('New password cannot be the same as your old password', HttpStatus.BAD_REQUEST);
  }
  
  if (dto.newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', HttpStatus.BAD_REQUEST);
  }

  if (!/[A-Z]/.test(dto.newPassword)) {
    throw new AppError('Password must contain at least one uppercase letter', HttpStatus.BAD_REQUEST);
  }

  if (!/[a-z]/.test(dto.newPassword)) {
    throw new AppError('Password must contain at least one lowercase letter', HttpStatus.BAD_REQUEST);
  }

  if (!/[0-9]/.test(dto.newPassword)) {
    throw new AppError('Password must contain at least one number', HttpStatus.BAD_REQUEST);
  }

  
  const passwordHash = await bcrypt.hash(dto.newPassword, 10);
  
 
 
    await this._landlordRepo.updateByEmail(dto.email, { passwordHash });
  

  logger.info('Password reset success', { email: dto.email, userId: landlord._id, role: landlord.role });
  return { success: true };
}


async landlordForgotPassword(dto: forgotPasswordDto): Promise<{ email: string; otpSent: boolean }> {
   logger.info('Landlord forgot password', { email: dto.email });
  const landlord = await this._landlordRepo.findByEmail(dto.email);
   if (!landlord ) {
        logger.warn('Forgot password failed - invalid user', { 
        email: dto.email,
        exists: !!landlord,
        
      });
      throw new AppError('No account found with this email address', HttpStatus.UNAUTHORIZED);
    }


      if ( !landlord.isEmailVerified ) {
        logger.warn('Forgot password failed - invalid email', { 
        email: dto.email,
      
        verified: landlord?.isEmailVerified,
        
      });
      throw new AppError('Email not not verified', HttpStatus.UNAUTHORIZED);
    }

      if ( !landlord.isActive) {
        logger.warn('Forgot password failed - invalid user', { 
        email: dto.email,
        
        active: landlord?.isActive 
      });
      throw new AppError('Your account is currently inactive', HttpStatus.UNAUTHORIZED);
    }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
   logger.debug('Reset OTP generated', { 
      email: dto.email,
      otpMasked: otp.substring(0, 3) + '***' 
    });
  await this._redisService.setOtp(landlord.email, otp);
   console.log(`OTP ${otp} sent to ${landlord.email}`);
  await this._redisService.setResendLock(landlord.email);
  await this._emailService.sendOtpEmail(landlord.email, otp);
logger.info('Forgot password OTP sent', { email: landlord.email });
  return {
    email: landlord.email,
    otpSent: true,
  };
}

 

async refreshLandlordToken(refreshToken:string):Promise<{ accessToken: string }>{
logger.info('Token refresh processing');
console.log("refresh service1",refreshToken)
   const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET!) as {
    userId: string;
    email: string;
    role: string;
  };

  logger.debug('Refresh token decoded', { userId: decoded.userId });
  const payload = {_id:decoded.userId,email:decoded.email,role:decoded.role}
  const newAccessToken = jwt.sign(
    payload,
    ENV.JWT_ACCESS_SECRET,
    {expiresIn:'15m'}
  )

logger.info('Token refresh success', { userId: decoded.userId });
console.log("refresh service2")

  return {accessToken:newAccessToken}




}









}