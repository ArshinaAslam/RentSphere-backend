import { forgotPasswordDto, resendOtpDto, resetPasswordDto, UserLoginDto, UserSignupDto, verifyOtpDto } from "../../../dto/tenant/tenant.auth.dto";




export interface UserSignupResult {
  email: string;
  otpSent : boolean;
}



export interface TenantLoginResult {
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


 





export interface UserProfile{
  id: string ; 
  email: string ;
   role: string ;
   fullName:string;
   avatar?:string,
   phone:string
}





export interface BaseUserProfile {
  id: string;
  email: string;
  role: 'TENANT' | 'LANDLORD' | 'ADMIN';
  fullName: string;
  avatar?: string;
  phone?: string;
}





export interface EditTenantProfileResult {
  user: UserProfile;
}







export interface ITenantAuthService {
  googleAuth({ token, role }: { token: string; role: string }): Promise<TenantLoginResult>
  tenantSignup(dto : UserSignupDto): Promise<UserSignupResult>;
  verifyTenantOtp(dto : verifyOtpDto):Promise<{success:boolean}>
  resendTenantOtp(dto:resendOtpDto):Promise<{success:boolean}>
  tenantLogin(dto:UserLoginDto):Promise<TenantLoginResult>
 
  tenantForgotPassword(dto:forgotPasswordDto):Promise<UserSignupResult>
  resetTenantPassword(dto:resetPasswordDto):Promise<{success:boolean}>
  
  refreshToken(refreshToken:string):Promise<{ accessToken: string }>
 
 
}
