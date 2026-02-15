
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



import { ITenantAuthService, TenantLoginResult, UserSignupResult } from "../../interface/tenant/ITenantAuthService";
import { forgotPasswordDto, resendOtpDto, resetPasswordDto, UserSignupDto, verifyOtpDto } from "../../../dto/tenant/tenant.auth.dto";






@injectable()
export class TenantAuthService implements ITenantAuthService{
  constructor(
    @inject(DI_TYPES.TenantRepository)
    private readonly _userRepo : ITenantRepository,
    @inject(DI_TYPES.RedisService)
    private readonly _redisService: IRedisService,
    @inject(DI_TYPES.EmailService)
    private readonly _emailService:IEmailService,

     ){}

     async tenantSignup(dto: UserSignupDto): Promise<UserSignupResult> {
      logger.info('Tenant signup processing', { email: dto.email });
    
        
          const existing = await this._userRepo.findByEmail(dto.email)
          if(existing?.isEmailVerified){
            logger.warn('Email already exists', { email: dto.email });
            throw new AppError(MESSAGES.AUTH.EMAIL_EXISTS,HttpStatus.CONFLICT)
          }

      

          const  passwordHash = await  bcrypt.hash(dto.password,10)

          const tenant = await this._userRepo.create({
            firstName : dto.firstName,
            lastName : dto.lastName,
            email : dto.email,
            phone : dto.phone,
            passwordHash,
            role : dto.role 

          })

          const otp = Math.floor(100000+Math.random()*900000).toString()
          logger.debug('OTP generated', { email: dto.email, otp });
          await this._redisService.setOtp(tenant.email,otp)
          console.log(`OTP ${otp} sent to ${tenant.email}`);

          await this._redisService.setResendLock(tenant.email)

          await this._emailService.sendOtpEmail(tenant.email, otp);
    logger.info('Tenant signup complete', { email: tenant.email });
     
         return {
          
          email : tenant.email,
          otpSent : true
         }  
         
     }

     
     





async googleAuth({ token, role }: { token: string; role: string }): Promise<TenantLoginResult> {
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
  

  let user = await this._userRepo.findByEmail(email);

  
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
    user = await this._userRepo.create(newUserData);
  }


  const existingUser = await this._userRepo.findByEmail(email);

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






     async verifyTenantOtp(dto:verifyOtpDto):Promise<{ success: boolean }>{
      logger.info('Tenant OTP verification', { email: dto.email });
          const storedOtp = await this._redisService.getOtp(dto.email)

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


          await this._redisService.deleteOtp(dto.email)
         await this._userRepo.updateByEmail(dto.email, {isEmailVerified: true, isActive: true})

logger.info('Tenant OTP verified successfully', { email: dto.email });
         return {success:true}
     }










async resendTenantOtp(dto: resendOtpDto): Promise<{ success: boolean }> {
  logger.info('OTP resend request', { email: dto.email });

 
  let existing = await this._userRepo.findByEmail(dto.email);
  
  
 
  if (!existing) {
    logger.warn('OTP resend failed - user not found', { email: dto.email });
    throw new AppError("User not found", HttpStatus.NOT_FOUND);
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










async tenantLogin(dto:any):Promise<TenantLoginResult>{
logger.info('Tenant login validation', { email: dto.email });
   const user = await this._userRepo.findByEmail(dto.email);
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






async tenantForgotPassword(dto:forgotPasswordDto):Promise<UserSignupResult>{
   logger.info('Tenant forgot password', { email: dto.email });
    const tenant = await this._userRepo.findByEmail(dto.email);
    if (!tenant ) {
        logger.warn('Forgot password failed - invalid user', { 
        email: dto.email,
        exists: !!tenant,
        
      });
      throw new AppError('No account found with this email address', HttpStatus.UNAUTHORIZED);
    }


      if ( !tenant.isEmailVerified ) {
        logger.warn('Forgot password failed - invalid email', { 
        email: dto.email,
      
        verified: tenant?.isEmailVerified,
        
      });
      throw new AppError('Email not not verified', HttpStatus.UNAUTHORIZED);
    }

      if ( !tenant.isActive) {
        logger.warn('Forgot password failed - invalid user', { 
        email: dto.email,
        
        active: tenant?.isActive 
      });
      throw new AppError('Your account is currently inactive', HttpStatus.UNAUTHORIZED);
    }
    
          const otp = Math.floor(100000+Math.random()*900000).toString()
           logger.debug('Reset OTP generated', { 
      email: dto.email,
      otpMasked: otp.substring(0, 3) + '***' 
    });
          await this._redisService.setOtp(tenant.email,otp)
          console.log(`OTP ${otp} sent to ${tenant.email}`);

          await this._redisService.setResendLock(tenant.email)

          await this._emailService.sendOtpEmail(tenant.email, otp);
    
     logger.info('Forgot password OTP sent', { email: tenant.email });
         return {
          
          email : tenant.email,
          otpSent : true
         } 


}



async resetTenantPassword(dto: resetPasswordDto): Promise<{ success: boolean }> {
  logger.info('Password reset processing', { email: dto.email });

 
  let user = await this._userRepo.findByEmail(dto.email);
 

  if (!user) {
    throw new AppError('User not found', HttpStatus.NOT_FOUND);
  }

  
  const isSameAsOldPassword = await bcrypt.compare(dto.newPassword, user.passwordHash);
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
  
 
 
    await this._userRepo.updateByEmail(dto.email, { passwordHash });
  

  logger.info('Password reset success', { email: dto.email, userId: user._id, role: user.role });
  return { success: true };
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













}