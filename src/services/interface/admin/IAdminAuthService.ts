import { AdminLoginDto } from "../../../dto/admin/admin.auth.dto";

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


export interface IAdminAuthService{
    adminLogin(dto: AdminLoginDto): Promise<AdminLoginResult> ;
    refreshAdminToken(refreshToken:string):Promise<{ accessToken: string }>
}

