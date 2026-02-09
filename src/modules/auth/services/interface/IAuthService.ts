
import { AdminLoginResult, changePasswordDto,  editLandlordProfileDto,  editTenantProfileDto, forgotPasswordDto, getKycStatusDto, resendOtpDto, resetPasswordDto, SubmitKycDto, SubmitLandlordKycDto, UserLoginDto,  UserSignupDto, verifyOtpDto } from "../../dto/tenantSignup.dto";


export interface UserSignupResult {
  email: string;
  otpSent : boolean;
}

export interface TenantLoginResult {
   user: { id: string ; email: string ; role: string ;fullName:string;phone:string;avatar?:string},
    tokens: { accessToken : string; refreshToken:string }
}


export interface verifyLandlordOtpResult {
     fullName: string;
  email: string;
  phone: string;
}

export interface KycResponse {
  kycId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  // message: string;
  // submittedAt: Date;
}



export interface UserProfile{
  id: string ; 
  email: string ;
   role: string ;
   fullName:string;
   avatar?:string,
   phone:string
}


export interface EditTenantProfileResult {
  user: UserProfile;
}







export interface KycFiles {
  aadhaarFront: Express.Multer.File;
  aadhaarBack?: Express.Multer.File;
  panCard: Express.Multer.File;
  selfie?: Express.Multer.File;
}

export interface KycFormData {
  email: string;
  aadhaarNumber: string;
  panNumber: string;
}

export interface KycDocument {
  userId: string;
  email: string;
  aadhaarNumber: string;
  panNumber: string;
  documents: {
    aadhaarFront: string;
    aadhaarBack?: string;
    panCard: string;
    selfie?: string;
  };
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  submittedAt: Date;
}

export interface KycResult {
  kycId: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | "NOT_SUBMITTED";
  kycRejectedReason?: string | null;
  // kycSubmittedAt?: Date | null;
}
export interface IAuthService {
  googleAuth({ token, role }: { token: string; role: string }): Promise<TenantLoginResult>
  tenantSignup(dto : UserSignupDto): Promise<UserSignupResult>;
  verifyTenantOtp(dto : verifyOtpDto):Promise<{success:boolean}>
  resendOtp(dto:resendOtpDto):Promise<{success:boolean}>
  tenantLogin(dto:UserLoginDto):Promise<TenantLoginResult>
  landlordLogin(dto: UserLoginDto): Promise<TenantLoginResult>
  tenantForgotPassword(dto:forgotPasswordDto):Promise<UserSignupResult>
  tenantResetPassword(dto:resetPasswordDto):Promise<{success:boolean}>
  landlordForgotPassword(dto: forgotPasswordDto): Promise<{ email: string; otpSent: boolean }>
  refreshToken(refreshToken:string):Promise<{ accessToken: string }>
  landlordSignup(dto : UserSignupDto ) : Promise<UserSignupResult>
  verifyLandlordOtp(dto: verifyOtpDto): Promise<verifyLandlordOtpResult>
  getUser(userId: string,role:string): Promise<UserProfile>
  submitKyc(userId: string, dto: SubmitLandlordKycDto ): Promise<KycResult>
  editTenantProfile(dto: editTenantProfileDto, userId: string): Promise<EditTenantProfileResult>;
  changeTenantPassword(dto: changePasswordDto, userId: string): Promise<{ user: UserProfile }>
  adminLogin(dto: UserLoginDto): Promise<AdminLoginResult>
   getKycStatus(dto: getKycStatusDto): Promise<KycResult>
   editLandlordProfile(dto: editLandlordProfileDto, userId: string): Promise<{ user: UserProfile }>
   changeLandlordPassword(dto: changePasswordDto, userId: string): Promise<{ user: UserProfile }>
}
