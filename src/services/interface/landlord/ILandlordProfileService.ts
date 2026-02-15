import { changePasswordDto, editLandlordProfileDto } from "../../../dto/landlord/landlord.profile.dto";





export interface LandlordProfile{
  id: string ; 
  email: string ;
   role: string ;
   fullName:string;
   avatar?:string,
   phone:string
}










export interface ILandlordProfileService {
  
 editLandlordProfile(dto:editLandlordProfileDto,userId: string):Promise<{ user:LandlordProfile }>
  
  changeLandlordPassword(dto: changePasswordDto, userId: string): Promise<{ user: LandlordProfile }>
  }
