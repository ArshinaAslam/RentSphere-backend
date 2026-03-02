import type {
  GetUsersDto,
  TenantsListResultDto,
  ToggleUserStatusDto,
} from "../../../dto/admin/admin.user.dto";

export interface TenantStatusResult {
  id: string;
  userId: string;
  fullName: string;
  status: "active" | "blocked";
}
export interface IAdminTenantService {
  getTenants(dto: GetUsersDto): Promise<TenantsListResultDto>;

  toggleTenantStatus(
    id: string,
    dto: ToggleUserStatusDto,
  ): Promise<TenantStatusResult>;
}
