import type {
  changePasswordDto,
  editTenantProfileDto,
  UserProfileDto,
} from "../../../dto/tenant/tenant.profile.dto";

export interface ITenantProfileService {
  editTenantProfile(
    dto: editTenantProfileDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<{ user: UserProfileDto }>;

  changeTenantPassword(
    dto: changePasswordDto,
    userId: string,
  ): Promise<{ user: UserProfileDto }>;
}
