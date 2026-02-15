import { UserRole } from "../../models/tenantModel";




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









