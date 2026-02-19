import { GetUsersDto,ToggleUserStatusDto } from '../../../dto/admin/admin.user.dto';

export interface TenantsListResult {
  users: Array<{
    id: string;
    tenantId: string;
    fullName: string;
    email: string;
    phone: string;
    status: 'active' | 'blocked';
    kycStatus: string;
    // joinedAt: string;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export interface TenantStatusResult {
  id: string;
  userId: string;
  fullName: string;
  status: 'active' | 'blocked';
}
export interface IAdminTenantService {
  getTenants(dto: GetUsersDto): Promise<TenantsListResult>;
 
  toggleTenantStatus(id: string, dto: ToggleUserStatusDto): Promise<TenantStatusResult>;
  
}