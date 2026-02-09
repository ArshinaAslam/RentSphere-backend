import { IAuthService, KycFiles, KycFormData, KycResponse, KycResult, TenantLoginResult, UserProfile, UserSignupResult, verifyLandlordOtpResult} from "../interface/IAuthService";
import { injectable , inject } from "tsyringe";
import { DI_TYPES } from "../../../../common/di/types";
import { ITenantRepository } from "../../../../shared/repositories/interface/ITenantRepository";
import { AdminLoginResult, changePasswordDto, editLandlordProfileDto, editTenantProfileDto, forgotPasswordDto, getKycStatusDto, resendOtpDto, resetPasswordDto, SubmitKycDto, SubmitLandlordKycDto, UserLoginDto, UserSignupDto, verifyOtpDto} from "../../dto/tenantSignup.dto";
import bcrypt from 'bcryptjs'
import { HttpStatus } from "../../../../common/enums/httpStatus.enum";
import { MESSAGES } from "../../../../common/constants/statusMessages";
import { AppError } from "../../../../common/errors/appError";
import { IRedisService } from "../interface/IRedisService";
import { IEmailService } from "../interface/IEmailService";
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library'
import { v4 as uuidv4 } from 'uuid';


import { ENV } from "../../../../config/env";
import { ITenant, UserRole } from "../../../../models/tenantModel";
import { ILandlord } from "../../../../models/landlordModel";
import { ILandlordRepository } from "../../../../shared/repositories/interface/ILandlordRepository";
import logger from "../../../../utils/logger";
import { IAdminRepository } from "../../repositories/interface/IAdminRepository";
import { uploadToS3 } from "../../../../config/s3";
// import { uploadToS3 } from "../../../../config/s3";

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
export class AuthService implements IAuthService{
  constructor(
    @inject(DI_TYPES.TenantRepository)
    private readonly userRepo : ITenantRepository,
    @inject(DI_TYPES.RedisService)
    private readonly redisService: IRedisService,
    @inject(DI_TYPES.EmailService)
    private readonly emailService:IEmailService,
    @inject(DI_TYPES.LandlordRepository)
    private readonly landlordRepo : ILandlordRepository,
    @inject (DI_TYPES.AdminRepository)
   private readonly adminRepo:IAdminRepository
     ){}

     async tenantSignup(dto: UserSignupDto): Promise<UserSignupResult> {
      logger.info('Tenant signup processing', { email: dto.email });
    
        
          const existing = await this.userRepo.findByEmail(dto.email)
          if(existing?.isEmailVerified){
            logger.warn('Email already exists', { email: dto.email });
            throw new AppError(MESSAGES.AUTH.EMAIL_EXISTS,HttpStatus.CONFLICT)
          }

          const  passwordHash = await  bcrypt.hash(dto.password,10)

          const tenant = await this.userRepo.create({
            firstName : dto.firstName,
            lastName : dto.lastName,
            email : dto.email,
            phone : dto.phone,
            passwordHash,
            role : dto.role 

          })

          const otp = Math.floor(100000+Math.random()*900000).toString()
          logger.debug('OTP generated', { email: dto.email, otp });
          await this.redisService.setOtp(tenant.email,otp)
          console.log(`OTP ${otp} sent to ${tenant.email}`);

          await this.redisService.setResendLock(tenant.email)

          await this.emailService.sendOtpEmail(tenant.email, otp);
    logger.info('Tenant signup complete', { email: tenant.email });
     
         return {
          
          email : tenant.email,
          otpSent : true
         }  
         
     }

     
     


    
// async googleAuth({ token, role }: { token: string; role: string }): Promise<TenantLoginResult> {
//  logger.info('Google OAuth processing', { role });
//   const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);
//   const ticket = await client.verifyIdToken({
//     idToken: token,
//     audience: ENV.GOOGLE_CLIENT_ID,
//   })

//   const payload = ticket.getPayload();
//   logger.warn('Google OAuth failed - invalid token', { role });
//   if (!payload ) {
//     throw new AppError('Invalid Google token', HttpStatus.UNAUTHORIZED);
//   }

//   const { email, given_name: firstName='', family_name: lastName='', picture: avatar, sub: googleId } = payload;


//   if (!email) {
//     logger.warn('Google OAuth failed - no email', { role, googleId: googleId?.substring(0, 8) });
//   throw new AppError('Google account must have an email associated', HttpStatus.BAD_REQUEST);
// }
  
//   logger.debug('Google user data', { email, role, googleId: googleId?.substring(0, 8) });
  
//   const repo = role === 'TENANT' ? this.userRepo : this.landlordRepo;
//   let user = await repo.findByEmail(email);

  
//   if (!user) {
//      logger.info('Google OAuth - creating new user', { email, role });
//     const newUserData : Partial<ITenant> | Partial<ILandlord> = {
//       firstName:firstName || 'User',
//       lastName:lastName || '',
//       email,
//       role:role as UserRole,
//       avatar: avatar || '',
//       googleId,
//       isEmailVerified: true,
//       isActive: true,
//       phone: '',
     
//     };
    
//     logger.info('Google user created', { email, role });
//     user = await repo.create(newUserData);
//   }


//   const existingUser = await this.userRepo.findByEmail(email);
//   const existingLandlord = await this.landlordRepo.findByEmail(email);
//   if (existingUser && existingUser.role !== role) {
//      logger.warn('Google OAuth blocked - role conflict', { email, requestedRole: role, existingRole: existingUser.role });
//     throw new AppError('Email already registered with different role', HttpStatus.CONFLICT);
//   }
//   if (existingLandlord && existingLandlord.role !== role) {
//      logger.warn('Google OAuth blocked - role conflict', { email, requestedRole: role, existingRole: existingLandlord.role });
//     throw new AppError('Email already registered with different role', HttpStatus.CONFLICT);
//   }

  
//   const payloadJwt = { userId: user._id, email: user.email, role: user.role };
//   const accessToken = jwt.sign(payloadJwt, ENV.JWT_ACCESS_SECRET, { expiresIn: '15m' });
//   const refreshToken = jwt.sign(payloadJwt, ENV.JWT_REFRESH_SECRET, { expiresIn: '7d' });


//  logger.info('Google OAuth complete - tokens generated', { 
//     userId: user._id,
//     email: user.email,
//     role: user.role 
//   });

//   return {
//     user: { 
//       id: user._id.toString(), 
//       email: user.email, 
//       role: user.role,
//       fullName: `${user.firstName} ${user.lastName}`,
//       avatar: user.avatar || '',
//       phone : user.phone
//     },
//     tokens: { accessToken, refreshToken }
//   };
// }



 async googleAuth({ token, role }: { token: string; role: string }): Promise<TenantLoginResult> {
  logger.info('Google OAuth processing', { role });
  
  const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: ENV.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new AppError('Invalid Google token', HttpStatus.UNAUTHORIZED);
  }

  const { email, given_name: firstName='', family_name: lastName='', picture: avatar, sub: googleId } = payload;
  
  if (!email) {
    throw new AppError('Google account must have an email associated', HttpStatus.BAD_REQUEST);
  }

  logger.debug('Google user data', { email, role, googleId: googleId?.substring(0, 8) });

  
  let user: ITenant | ILandlord | null

  if (role === 'TENANT') {
    
   const existingTenant = await this.userRepo.findByEmail(email);
    
    if (!existingTenant) {
     
      const newTenantData: Partial<ITenant> = {
        firstName: firstName || 'User',
        lastName: lastName || '',
        email,
        role: 'TENANT' as UserRole,
        avatar: avatar || '',
        googleId,
        isEmailVerified: true,
        isActive: true,
        phone: '',
      };
      user = await this.userRepo.create(newTenantData);
      logger.info('New tenant created via Google OAuth', { email });
    }else{
      user = existingTenant; 
    }
  } else {
   const existingLandlord = await this.landlordRepo.findByEmail(email);
    
    if (!existingLandlord) {
      const newLandlordData: Partial<ILandlord> = {
        firstName: firstName || 'User',
        lastName: lastName || '',
        email,
        role: 'LANDLORD' as UserRole,
        avatar: avatar || '',
        googleId,
        isEmailVerified: true,
        isActive: true,
        phone: '',
        kycStatus: 'NOT_SUBMITTED',
      };
      user = await this.landlordRepo.create(newLandlordData);
      logger.info('New landlord created via Google OAuth', { email });
    }else{
      user = existingLandlord; 
    }
  }

  if (user.role !== role) {
    logger.warn('Google OAuth blocked - role conflict', { 
      email, 
      requestedRole: role, 
      existingRole: user.role 
    });
    throw new AppError('Email already registered with different role', HttpStatus.CONFLICT);
  }

  
  const payloadJwt = { 
    userId: user._id.toString(),  
    email: user.email, 
    role: user.role 
  };
  
  const accessToken = jwt.sign(payloadJwt, ENV.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payloadJwt, ENV.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  logger.info('Google OAuth complete', { 
    userId: user._id.toString(),
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
      phone: user.phone || ''
    },
    tokens: { accessToken, refreshToken }
  };
}


     async landlordSignup(dto: UserSignupDto): Promise<UserSignupResult> {
       logger.info('Landlord signup processing', { email: dto.email });
  
         const existing = await this.landlordRepo.findByEmail(dto.email)
  if (existing?.isEmailVerified) {
    logger.warn('Landlord signup blocked - email exists', { email: dto.email });
    throw new AppError(MESSAGES.AUTH.EMAIL_EXISTS, HttpStatus.CONFLICT);
  }

  const passwordHash = await bcrypt.hash(dto.password, 10);
  const landlord = await this.landlordRepo.create({  
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
    otpMasked: otp.substring(0, 3) + '***' 
  });
  await this.redisService.setOtp(landlord.email, otp);
  console.log(`OTP ${otp} sent to ${landlord.email}`);
  await this.redisService.setResendLock(landlord.email);
  await this.emailService.sendOtpEmail(landlord.email, otp);
  

  logger.info('Landlord signup complete', { 
    email: landlord.email, 
    userId: landlord._id,
    kycStatus: 'PENDING' 
  });

  return { email: landlord.email, otpSent: true };
}



     async verifyTenantOtp(dto:verifyOtpDto):Promise<{ success: boolean }>{
      logger.info('Tenant OTP verification', { email: dto.email });
          const storedOtp = await this.redisService.getOtp(dto.email)

          if (!storedOtp) {
            logger.warn('Tenant OTP verification failed - expired', { email: dto.email });
        throw new AppError("OTP Expired. Please request a new one.", HttpStatus.BAD_REQUEST);
    }
          if(storedOtp !== dto.otp){
            logger.warn('Tenant OTP verification failed - invalid', { 
        email: dto.email,
        providedOtp: dto.otp.substring(0, 3) + '***',
        storedOtp: storedOtp.substring(0, 3) + '***'
      });
            throw new AppError("Invalid OTP. Please try again.",HttpStatus.BAD_REQUEST)
          }


          await this.redisService.deleteOtp(dto.email)
         await this.userRepo.updateByEmail(dto.email, {isEmailVerified: true, isActive: true})

logger.info('Tenant OTP verified successfully', { email: dto.email });
         return {success:true}
     }



     async verifyLandlordOtp(dto: verifyOtpDto): Promise<verifyLandlordOtpResult> {
      logger.info('Lnadord OTP verification', { email: dto.email });
  const storedOtp = await this.redisService.getOtp(dto.email);
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

  await this.redisService.deleteOtp(dto.email);
  await this.landlordRepo.updateByEmail(dto.email, { 
    isEmailVerified: true, 
    
  });

  const landlord = await this.landlordRepo.findByEmail(dto.email)
  if (!landlord) throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
logger.info('Landlord OTP verified successfully', { email: dto.email });
  return {
    fullName: `${landlord.firstName} ${landlord.lastName}`,
   
    email: landlord.email,
    phone: landlord.phone,
  }
}






  async resendOtp(dto: resendOtpDto): Promise<{success:boolean}> {
    logger.info('OTP resend request', { email: dto.email });
  const existing = await this.userRepo.findByEmail(dto.email);
  if (!existing) {
    logger.warn('OTP resend failed - user not found', { email: dto.email });
    throw new AppError("User not found", HttpStatus.NOT_FOUND);
  }
  
  // if (existing.isEmailVerified) {
  //   throw new AppError(MESSAGES.AUTH.EMAIL_EXISTS, HttpStatus.CONFLICT);
  // }

  
  const canResend = await this.redisService.canResendOtp(dto.email);
  if (!canResend) {
    logger.warn('OTP resend blocked - rate limited', { email: dto.email });
    throw new AppError("Please wait before requesting new OTP", HttpStatus.TOO_MANY_REQUESTS);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  logger.debug('OTP regenerated for resend', { 
      email: dto.email,
      otpMasked: otp.substring(0, 3) + '***' 
    });
  await this.redisService.setOtp(dto.email, otp);
  await this.redisService.setResendLock(dto.email);
   console.log(`OTP ${otp} resend to ${dto.email}`);

  await this.emailService.sendOtpEmail(dto.email, otp);
logger.info('OTP resend success', { email: dto.email });
  return {success:true};
}



async submitKyc(
  email: string, 
  dto: SubmitLandlordKycDto  
): Promise<KycResult> {
   console.log("reached kyc service1")

     const user = await this.landlordRepo.findByEmail(email);
     if (!user) {
      

       throw new AppError('User not found for this email',HttpStatus.NOT_FOUND)
     }
   
     const userId = user._id.toString();
     console.log("Found userId:", userId);
  
  const { aadhaarFront, panCard, aadhaarBack, selfie } = dto.files;

  // 1. S3 Uploads (Service business logic)
  const [aadhaarFrontUrl, panCardUrl, aadhaarBackUrl, selfieUrl] = await Promise.all([
    uploadToS3(aadhaarFront!, 'kyc/aadhaar', userId),
    uploadToS3(panCard!, 'kyc/pan', userId),
    aadhaarBack ? uploadToS3(aadhaarBack, 'kyc/aadhaar', userId) : Promise.resolve(''),
    selfie ? uploadToS3(selfie, 'kyc/selfie', userId) : Promise.resolve(''),
  ]);

  // 2. Validation (Service business rules)
  validateAadhaar(dto.aadhaarNumber);
  validatePan(dto.panNumber);

  // 3. Map to DB format (Service responsibility)
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

  // 4. Pure DB call
  const landlord = await this.landlordRepo.updateKyc(userId, dbData);
  if (!landlord) throw new AppError('Landlord not found', 404);
 console.log("reached kyc service2",landlord._id.toString())
  
  return { kycId: landlord._id.toString() ,kycStatus:landlord.kycStatus!, kycRejectedReason: landlord.kycRejectedReason || null};
}

async getKycStatus(dto: getKycStatusDto): Promise<KycResult> {
  console.log("check11")
  logger.info('Fetching KYC status for email', { email: dto.email });

  const landlord = await this.landlordRepo.findByEmail(dto.email);
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





// async submitLandlordKyc(dto: SubmitKycDto): Promise<KycResponse> {
//    const landlord = await this.landlordRepo.findByEmail(dto.email);
//       if (!landlord) {
//         throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
//       }

//        if (landlord.kycStatus !== 'NOT_SUBMITTED') {
//         throw new AppError(
//           `KYC already ${landlord.kycStatus.toLowerCase()}`, 
//           HttpStatus.BAD_REQUEST
//         );
//       }

//       const { files } = dto;
//       const requiredFiles = ['aadhaarFront', 'panCard', 'liveSelfie'] as const;
      
//             for (const fileKey of requiredFiles) {
//         const file = files[fileKey];
//         if (!file) {
//           throw new AppError(
//             `${fileKey.replace(/([A-Z])/g, ' $1')} is required`,
//             HttpStatus.BAD_REQUEST
//           );
//         }


//         if (file.size > 5 * 1024 * 1024) {
//           throw new AppError(
//             `${fileKey.replace(/([A-Z])/g, ' $1')} too large (max 5MB)`,
//             HttpStatus.BAD_REQUEST
//           );
//         }

//         if (!file.mimetype.startsWith('image/')) {
//           throw new AppError(
//             `${fileKey.replace(/([A-Z])/g, ' $1')} must be an image`,
//             HttpStatus.BAD_REQUEST
//           );
//         }
//       }


//       const kycId = `KYC_${uuidv4().slice(0, 8).toUpperCase()}`;
//      const [aadhaarFront, panCard, liveSelfie, aadhaarBack] = await Promise.all([
//     uploadToS3(files.aadhaarFront!, `${dto.email}_${kycId}_aadhaar_front.jpg`),
//     uploadToS3(files.panCard!, `${dto.email}_${kycId}_pan_card.jpg`),
//     uploadToS3(files.liveSelfie!, `${dto.email}_${kycId}_live_selfie.jpg`),
//       uploadToS3(files.aadhaarBack, `${dto.email}_${kycId}_aadhaar_back.jpg`)
      
//   ]);


//    await this.landlordRepo.updateByEmail(dto.email, {
//     kycStatus: 'PENDING',
//     kycDetails: {aadhaarNumber: dto.aadhaarNumber,panNumber: dto.panNumber},
//     kycDocuments: { aadhaarFront, aadhaarBack, panCard, liveSelfie },
//     kycSubmittedAt: new Date(),
  
//   });


  
//       return {
//         kycId,
//         status: 'PENDING',
        
//       };


// }



//------------------------------------
//  // ✅ Check KYC status
//   async checkKycStatus(dto: CheckKycStatusDto): Promise<KycResponse> {
//     const landlord = await this.landlordRepo.findByEmail(dto.email);
    
//     if (!landlord || landlord.kycStatus === 'NOT_SUBMITTED') {
//       throw new AppError('KYC not found or not submitted', HttpStatus.NOT_FOUND);
//     }

//     return {
//       kycId: landlord.kycId || '',
//       status: landlord.kycStatus as any,
//       message: this.getKycStatusMessage(landlord.kycStatus),
//       submittedAt: landlord.kycSubmittedAt!,
//     };
//   }

//   // ✅ Admin: Update KYC status
//   async updateKycStatus(dto: UpdateKycStatusDto): Promise<{ success: boolean }> {
//     const landlord = await this.landlordRepo.findByKycId(dto.kycId);
//     if (!landlord) {
//       throw new AppError('KYC record not found', HttpStatus.NOT_FOUND);
//     }

//     const updateData: any = { kycStatus: dto.status };

//     if (dto.status === 'APPROVED') {
//       updateData.isActive = true;
//       updateData.kycVerifiedAt = new Date();
//     } else if (dto.status === 'REJECTED') {
//       updateData.kycRejectedReason = dto.adminNotes || 'No reason provided';
//       updateData.kycVerifiedAt = new Date();
//     }

//     await this.landlordRepo.updateById(landlord._id!, updateData);
//     return { success: true };
//   }

//   // ✅ Helper method
//   private getKycStatusMessage(status: string): string {
//     const messages: Record<string, string> = {
//       NOT_SUBMITTED: 'KYC not submitted yet',
//       PENDING: 'Waiting for admin approval',
//       APPROVED: 'KYC approved! You can now login.',
//       REJECTED: 'KYC rejected. Please resubmit documents.',
//     };
//     return messages[status] || 'Unknown status';
//   }
// }



async tenantLogin(dto:UserLoginDto):Promise<TenantLoginResult>{
logger.info('Tenant login validation', { email: dto.email });
   const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
       logger.warn('Login failed - user not found', { email: dto.email });
      throw new AppError('Email not exist', HttpStatus.UNAUTHORIZED);
    }

    //  if ( !user.isEmailVerified || !user.isActive) {
    //   logger.warn('Login failed - inactive/unverified', { email: dto.email });
    //   throw new AppError('Email is not verified', HttpStatus.UNAUTHORIZED);
    // }

     if ( !user.isEmailVerified ) {
      logger.warn('Login failed - unverified', { email: dto.email });
      throw new AppError('Email is not verified', HttpStatus.UNAUTHORIZED);
    }

     if (  !user.isActive) {
      logger.warn('Login failed - inactive', { email: dto.email });
      throw new AppError('Email is inactive', HttpStatus.UNAUTHORIZED);
    }




 const isValidPassword = await bcrypt.compare(dto.password,user.passwordHash)

 if(!isValidPassword){
  logger.warn('Login failed - wrong password', { email: dto.email });
  throw new AppError('Password is incorrect', HttpStatus.UNAUTHORIZED)
 }
 

 // Generate tokens
  const payload = { userId: user._id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: '7d' });

logger.info('Tenant login success', { userId: user._id, email: user.email });
 
  return {
    user: { 
      id: user._id.toString(), 
      email: user.email, 
      role: user.role,
      fullName: `${user.firstName} ${user.lastName}`,
      phone : user.phone,
      
     },
    tokens: { accessToken, refreshToken }
  };

}

async landlordLogin(dto: UserLoginDto): Promise<TenantLoginResult> {  
  logger.info('Landlord login validation', { email: dto.email });


  const landlord = await this.landlordRepo.findByEmail(dto.email);
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
      
    },
    tokens: { accessToken, refreshToken }
  };
}




async tenantForgotPassword(dto:forgotPasswordDto):Promise<UserSignupResult>{
   logger.info('Tenant forgot password', { email: dto.email });
    const tenant = await this.userRepo.findByEmail(dto.email);
    if (!tenant || !tenant.isEmailVerified || !tenant.isActive) {
        logger.warn('Forgot password failed - invalid user', { 
        email: dto.email,
        exists: !!tenant,
        verified: tenant?.isEmailVerified,
        active: tenant?.isActive 
      });
      throw new AppError('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    
          const otp = Math.floor(100000+Math.random()*900000).toString()
           logger.debug('Reset OTP generated', { 
      email: dto.email,
      otpMasked: otp.substring(0, 3) + '***' 
    });
          await this.redisService.setOtp(tenant.email,otp)
          console.log(`OTP ${otp} sent to ${tenant.email}`);

          await this.redisService.setResendLock(tenant.email)

          await this.emailService.sendOtpEmail(tenant.email, otp);
    
     logger.info('Forgot password OTP sent', { email: tenant.email });
         return {
          
          email : tenant.email,
          otpSent : true
         } 


}


async tenantResetPassword(dto:resetPasswordDto):Promise<{success:boolean}>{
  logger.info('Tenant password reset processing', { email: dto.email });
  
  const user = await this.userRepo.findByEmail(dto.email);
  if (!user) {
     logger.warn('Password reset failed - user not found', { email: dto.email });
    throw new AppError('User not found', HttpStatus.NOT_FOUND);
  }

  const passwordHash = await bcrypt.hash(dto.newPassword, 10);
  await this.userRepo.updateByEmail(dto.email, { passwordHash });
  logger.info('Tenant password reset success', { email: dto.email, userId: user._id });
    return {success:true}


}

async landlordForgotPassword(dto: forgotPasswordDto): Promise<{ email: string; otpSent: boolean }> {
   logger.info('Landlord forgot password', { email: dto.email });
  const landlord = await this.landlordRepo.findByEmail(dto.email);
  if (!landlord || !landlord.isEmailVerified || !landlord.isActive) {
      logger.warn('Forgot password failed - invalid Landlord', { 
        email: dto.email,
        exists: !!landlord,
        verified: landlord?.isEmailVerified,
        active: landlord?.isActive 
      });
    throw new AppError("Invalid email or account not active", HttpStatus.UNAUTHORIZED);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
   logger.debug('Reset OTP generated', { 
      email: dto.email,
      otpMasked: otp.substring(0, 3) + '***' 
    });
  await this.redisService.setOtp(landlord.email, otp);
   console.log(`OTP ${otp} sent to ${landlord.email}`);
  await this.redisService.setResendLock(landlord.email);
  await this.emailService.sendOtpEmail(landlord.email, otp);
logger.info('Forgot password OTP sent', { email: landlord.email });
  return {
    email: landlord.email,
    otpSent: true,
  };
}

 

async refreshToken(refreshToken:string):Promise<{ accessToken: string }>{
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


// async getUser(userId: string): Promise<UserProfile> {
  
//     logger.info('Fetching user profile', { userId });
//     const user = await this.userRepo.findById(userId);
//     console.log('getUSER DB user:', user);
    
//     if (!user) {
//       logger.warn('User profile not found', { userId });
//       throw new AppError('User not found', HttpStatus.NOT_FOUND);
//     }



    

//       logger.debug('User profile fetched', { 
//       userId: user._id,
//       email: user.email,
//       role: user.role 
      

//     });
// console.log("go from getuser")

//     return {
//       id: user._id.toString(),
//       email: user.email,
//       role: user.role as 'TENANT' | 'LANDLORD',
//       fullName: `${user.firstName} ${user.lastName}`.trim(),
//       avatar: user.avatar || '',
//       phone:user.phone
//     };
  
// }

async getUser(userId: string, role: string): Promise<UserProfile> {
  logger.info('Fetching user profile', { userId, role });
  
  let user;

  // ✅ PERFECT - Route to correct repo based on role
  if (role === 'LANDLORD') {
    user = await this.landlordRepo.findById(userId);
  } else {
    // Default to TENANT or throw error for other roles
    user = await this.userRepo.findById(userId);
  }

  console.log('getUSER DB user:', user);

  if (!user) {
    logger.warn('User profile not found', { userId, role });
    throw new AppError('User not found', HttpStatus.NOT_FOUND);
  }

  logger.debug('User profile fetched', { 
    userId: user._id,
    email: user.email,
    role: user.role 
  });

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role as 'TENANT' | 'LANDLORD',
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    avatar: user.avatar || '',
    phone: user.phone,
     
  };
}



async editTenantProfile(dto:editTenantProfileDto,userId: string):Promise<{ user: UserProfile }> {
     logger.info('Tenant profile edit processing', { 
    userId, 
    firstName: dto.firstName,
    phone: dto.phone 
  });

  console.log("go from service1")
  const tenant = await this.userRepo.findById(userId);
  if (!tenant) {
    logger.warn('Profile edit failed - tenant not found', { userId });
    throw new AppError('Tenant not found', HttpStatus.NOT_FOUND);
  }


    const updateData: Partial<ITenant> = {
    firstName: dto.firstName,
    lastName: dto.lastName,
    phone: dto.phone,
    ...(dto.avatar && { avatar: dto.avatar }),
    updatedAt: new Date(),
  };


  const updatedTenant = await this.userRepo.update(userId, updateData);


 if (!updatedTenant) {
    logger.warn('Profile edit failed - tenant not found', { userId });
    throw new AppError('Tenant not found', HttpStatus.NOT_FOUND);
  }

  logger.info('Tenant profile updated successfully', { 
    userId: updatedTenant._id,
    email: updatedTenant.email 
  });


 console.log("go from service2")
   return {
    user: {
      id: updatedTenant._id.toString(),
      email: updatedTenant.email,
      role: updatedTenant.role as 'TENANT' | 'LANDLORD',
      fullName: `${updatedTenant.firstName} ${updatedTenant.lastName}`.trim(),
      avatar: updatedTenant.avatar || '',
      phone: updatedTenant.phone,
    }
  };
}


async editLandlordProfile(dto: editLandlordProfileDto, userId: string): Promise<{ user: UserProfile }> {
  logger.info('Landlord profile edit processing', { 
    userId, 
    firstName: dto.firstName,
    phone: dto.phone 
  });

   console.log("hybyservice1")
  
  const landlord = await this.landlordRepo.findById(userId);
  if (!landlord) {
    logger.warn('Profile edit failed - landlord not found', { userId });
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }
  console.log("hybyservice2",landlord)
  const updateData: Partial<ILandlord> = {
    firstName: dto.firstName,
    lastName: dto.lastName,
    phone: dto.phone,
    ...(dto.avatar && { avatar: dto.avatar }),
    updatedAt: new Date(),
  };

  const updatedLandlord = await this.landlordRepo.update(userId, updateData);

  if (!updatedLandlord) {
    logger.warn('Profile edit failed - landlord not found', { userId });
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }

  logger.info('Landlord profile updated successfully', { 
    userId: updatedLandlord._id,
    email: updatedLandlord.email 
  });

console.log("hybyservice3")
  
  return {
    user: {
      id: updatedLandlord._id.toString(),
      email: updatedLandlord.email,
      role: updatedLandlord.role as 'TENANT' | 'LANDLORD',
      fullName: `${updatedLandlord.firstName} ${updatedLandlord.lastName}`.trim(),
      avatar: updatedLandlord.avatar || '',
      phone: updatedLandlord.phone,
    }
  };
}


async changeTenantPassword(dto: changePasswordDto, userId: string): Promise<{ user: UserProfile }> {
  logger.info('Password change processing', { 
    userId, 
    newPasswordLength: dto.newPassword.length 
  });

  const tenant = await this.userRepo.findById(userId);
  console.log("password service1",tenant)
  if (!tenant) {
    logger.warn('Password change failed - tenant not found', { userId });
    throw new AppError('Tenant not found', HttpStatus.NOT_FOUND);
  }

  
  const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, tenant.passwordHash);
  if (!isCurrentPasswordValid) {
    logger.warn('Password change failed - invalid current password', { userId });
    throw new AppError('Current password is incorrect', HttpStatus.BAD_REQUEST);
  }

  // ✅ CHECK NEW PASSWORD MATCH
  if (dto.newPassword !== dto.confirmPassword) {
    throw new AppError('New passwords do not match', HttpStatus.BAD_REQUEST);
  }

  // ✅ PASSWORD STRENGTH VALIDATION
  if (dto.newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', HttpStatus.BAD_REQUEST);
  }

  // ✅ HASH NEW PASSWORD
  const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

  const updateData: Partial<ITenant> = {
    passwordHash: hashedPassword,
    updatedAt: new Date(),
  };

  const updatedTenant = await this.userRepo.update(userId, updateData);

  if (!updatedTenant) {
    logger.warn('Password change failed - tenant not found', { userId });
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }

  logger.info('Password changed successfully', { 
    userId: updatedTenant._id,
    email: updatedTenant.email 
  });
  console.log("password service2")


  return {
    user: {
      id: updatedTenant._id.toString(),
      email: updatedTenant.email,
      role: updatedTenant.role as 'TENANT' | 'LANDLORD',
      fullName: `${updatedTenant.firstName} ${updatedTenant.lastName}`.trim(),
      avatar: updatedTenant.avatar || '',
      phone: updatedTenant.phone,
    }
  };
}


async changeLandlordPassword(dto: changePasswordDto, userId: string): Promise<{ user: UserProfile }> {
  logger.info('Password change processing', { 
    userId, 
    newPasswordLength: dto.newPassword.length 
  });

   console.log("changeservice1")

  const landlord = await this.landlordRepo.findById(userId);
  console.log("password service1",landlord)
  if (!landlord) {
    logger.warn('Password change failed - landlord not found', { userId });
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }

  
  const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, landlord.passwordHash);
  if (!isCurrentPasswordValid) {
    logger.warn('Password change failed - invalid current password', { userId });
    throw new AppError('Current password is incorrect', HttpStatus.BAD_REQUEST);
  }

  // ✅ CHECK NEW PASSWORD MATCH
  if (dto.newPassword !== dto.confirmPassword) {
    throw new AppError('New passwords do not match', HttpStatus.BAD_REQUEST);
  }

  // ✅ PASSWORD STRENGTH VALIDATION
  if (dto.newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', HttpStatus.BAD_REQUEST);
  }

  // ✅ HASH NEW PASSWORD
  const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

  const updateData: Partial<ILandlord> = {
    passwordHash: hashedPassword,
    updatedAt: new Date(),
  };

  const updatedLandlord = await this.landlordRepo.update(userId, updateData);

  if (!updatedLandlord) {
    logger.warn('Password change failed - landlord not found', { userId });
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }

  logger.info('Password changed successfully', { 
    userId: updatedLandlord._id,
    email: updatedLandlord.email 
  });
     console.log("changeservice2",updatedLandlord)


  return {
    user: {
      id: updatedLandlord._id.toString(),
      email: updatedLandlord.email,
      role: updatedLandlord.role as 'TENANT' | 'LANDLORD',
      fullName: `${updatedLandlord.firstName} ${updatedLandlord.lastName}`.trim(),
      avatar: updatedLandlord.avatar || '',
      phone: updatedLandlord.phone,
    }
  };
}


async adminLogin(dto: UserLoginDto): Promise<AdminLoginResult> {
  logger.info('Admin login validation', { email: dto.email });
  
  // Use AdminRepository (separate from tenant)
  const admin = await this.adminRepo.findByEmail(dto.email);
  
  if (!admin) {
    logger.warn('Admin login failed - admin not found', { email: dto.email });
    throw new AppError('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }

  // Admin-specific checks
  if (!admin.isActive) {
    logger.warn('Admin login failed - inactive admin', { email: dto.email });
    throw new AppError('Account is inactive. Contact support.', HttpStatus.UNAUTHORIZED);
  }

  // Password validation
  const isValidPassword = await bcrypt.compare(dto.password, admin.passwordHash);
  if (!isValidPassword) {
    logger.warn('Admin login failed - wrong password', { email: dto.email });
    throw new AppError('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }

  // Generate tokens (same payload structure)
  const payload = { 
    userId: admin._id, 
    email: admin.email, 
    role: 'ADMIN' 
  };
  const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  logger.info('Admin login success', { userId: admin._id, email: admin.email });

  return {
    user: { 
      id: admin._id.toString(), 
      email: admin.email, 
      role: 'ADMIN' as const,
     
    },
    tokens: { accessToken, refreshToken }
  };
}


}