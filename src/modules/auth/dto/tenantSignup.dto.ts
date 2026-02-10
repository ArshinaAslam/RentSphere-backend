import { UserRole } from "../../../models/tenantModel";



export interface UserSignupDto  {
    firstName : string ;
    lastName : string ;
    email : string ;
    phone : string ,
    password : string ;
    role:UserRole
}


export interface verifyOtpDto {
    otp :string ;
    email:string ;
}




export interface resendOtpDto{
    email:string;
}

export interface UserLoginDto{
    email:string;
    password:string;
}


export interface AdminLoginResult {
  user: {
    id: string;
    email: string;
    role: string;
   
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface forgotPasswordDto{
    email:string
}

export interface resetPasswordDto{
    newPassword : string;
    email : string;
}


export interface GoogleAuthDto {
  token: string;
  role: string; 
}

export type KycFiles = {
  aadhaarFront?: Express.Multer.File[];
  aadhaarBack?: Express.Multer.File[];
  panCard?: Express.Multer.File[];
  selfie?: Express.Multer.File[];
};


export interface SubmitLandlordKycDto {
  email: string;
  aadhaarNumber: string;
  panNumber: string;
  files: {
    aadhaarFront: Express.Multer.File | null;
    aadhaarBack: Express.Multer.File | null;
    panCard: Express.Multer.File | null;
    selfie: Express.Multer.File | null;
  };
}





export interface SubmitKycDto {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  aadhaarNumber: string;
  panNumber: string;
  files: {
    aadhaarFront: Express.Multer.File | null;
    aadhaarBack: Express.Multer.File | null;
    panCard: Express.Multer.File | null;
    liveSelfie: Express.Multer.File | null;
  };
}



export interface getKycStatusDto{
  email:string;
}
export interface editTenantProfileDto{
    firstName:string;
    lastName:string;
    phone:string;
    avatar?: string;
}


export interface editLandlordProfileDto{
    firstName:string;
    lastName:string;
    phone:string;
    avatar?: string;
}
export interface changePasswordDto{
    currentPassword : string;
    newPassword : string;
    confirmPassword: string;
}