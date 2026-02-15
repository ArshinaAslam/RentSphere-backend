import { getKycStatusDto, SubmitLandlordKycDto } from "../../../dto/landlord/landlord.auth.dto";
import { forgotPasswordDto, resendOtpDto, resetPasswordDto, UserLoginDto, UserSignupDto, verifyOtpDto } from "../../../dto/tenant/tenant.auth.dto";




export interface LandlordSignupResult {
  email: string;
  otpSent : boolean;
}



export interface LandlordLoginResult {
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


 





export interface LandlordProfile{
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





export interface EditLandlordProfileResult {
  user: LandlordProfile;
}




export interface verifyLandlordOtpResult{
    fullName : string;
    email:string;
    phone:string;
}



export interface KycResult {
  kycId: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | "NOT_SUBMITTED";
  kycRejectedReason?: string | null;
 
}

export interface ILandlordAuthService {
  googleAuth({ token, role }: { token: string; role: string }): Promise<LandlordLoginResult>
  landlordSignup(dto : UserSignupDto): Promise<LandlordSignupResult>;
  verifyLandlordOtp(dto : verifyOtpDto):Promise<verifyLandlordOtpResult>
  resendLandlordOtp(dto:resendOtpDto):Promise<{success:boolean}>
  landlordLogin(dto:UserLoginDto):Promise<LandlordLoginResult>
 
  landlordForgotPassword(dto:forgotPasswordDto):Promise<LandlordSignupResult>
  resetLandlordPassword(dto:resetPasswordDto):Promise<{success:boolean}>
  submitKyc(email: string, dto: SubmitLandlordKycDto): Promise<KycResult> 
  getKycStatus(dto: getKycStatusDto): Promise<KycResult> 
  refreshLandlordToken(refreshToken:string):Promise<{ accessToken: string }>
 
 
}
