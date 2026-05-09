export interface GetUsersDto {
  search?: string;
  role?: "TENANT" | "LANDLORD";
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export interface ToggleUserStatusDto {
  status: "active" | "blocked";
}

export interface TenantListItemDto {
  id: string;
  // tenantId: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | undefined;
  status: "active" | "blocked";
  kycStatus: string;
}

export interface TenantsListResultDto {
  users: TenantListItemDto[];
  total: number;
  page: number;
  totalPages: number;
}
