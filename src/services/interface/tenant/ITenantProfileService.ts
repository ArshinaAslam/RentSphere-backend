import { changePasswordDto, editTenantProfileDto } from "../../../dto/tenant/tenant.profile.dto";






export interface UserProfile{
  id: string ; 
  email: string ;
   role: string ;
   fullName:string;
   avatar?:string,
   phone:string
}










export interface ITenantProfileService {
  
 editTenantProfile(dto:editTenantProfileDto,userId: string):Promise<{ user:UserProfile }>
  
  changeTenantPassword(dto: changePasswordDto, userId: string): Promise<{ user: UserProfile }>
  }
