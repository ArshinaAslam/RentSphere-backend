

import { UserRole } from "../../models/tenantModel";


export interface editTenantProfileDto{
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