import { forgotPasswordDto, getKycStatusDto, LoginDto, resendOtpDto, resetPasswordDto, SignupDto, SubmitLandlordKycDto, verifyOtpDto } from "../../../dto/auth/auth.dto";
import { UserRole } from "../../../types/auth.types";



export interface SignupResult {
  email: string;
  otpSent : boolean;
}



export interface LoginResult {
   user: { id: string ;
     email: string ;
      role: string ;
      fullName:string;
      phone:string;
      avatar?:string;
       aadharNumber?:string;
    panNumber?:string;
     aadharFrontUrl?: string;
    aadharBackUrl?: string;
    panFrontUrl?: string;
     },
    tokens: { accessToken : string; refreshToken:string }
    
}


 









export interface BaseUserProfile {
  id: string;
  email: string;
  role: 'TENANT' | 'LANDLORD' 
  fullName: string;
  avatar?: string;
  phone?: string;
}







export interface verifyOtpResult{
    fullName : string;
    email:string;
    phone:string;
}



export interface KycResult {
  kycId: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | "NOT_SUBMITTED";
  kycRejectedReason?: string | null;
 
}

export interface IAuthService {
  googleAuth({ token, role }: { token: string; role: UserRole}): Promise<LoginResult>
  signup(dto : SignupDto): Promise<SignupResult>;
  verifyOtp(dto : verifyOtpDto):Promise<verifyOtpResult>
  resendOtp(dto:resendOtpDto):Promise<{success:boolean}>
  login(dto:LoginDto):Promise<LoginResult>
 
  forgotPassword(dto:forgotPasswordDto):Promise<SignupResult>
  resetPassword(dto:resetPasswordDto):Promise<{success:boolean}>
   refreshToken(refreshToken:string):Promise<{ accessToken: string }>
 
 
}
