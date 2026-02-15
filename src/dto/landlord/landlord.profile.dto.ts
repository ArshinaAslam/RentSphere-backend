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