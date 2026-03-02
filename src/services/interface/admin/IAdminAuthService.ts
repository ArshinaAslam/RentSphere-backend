import type {
  AdminLoginDto,
  AdminResponseDto,
} from "../../../dto/admin/admin.auth.dto";

export interface IAdminAuthService {
  adminLogin(dto: AdminLoginDto): Promise<AdminResponseDto>;
  // refreshAdminToken(refreshToken: string): Promise<{ accessToken: string }>;
}
