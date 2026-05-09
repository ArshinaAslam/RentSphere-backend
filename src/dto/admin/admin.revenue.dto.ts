export interface RevenueStatsDto {
  totalRevenue: number;
  totalVolume: number;
  totalCount: number;
  depositRevenue: number;
  rentRevenue: number;
  thisMonthRevenue: number;
  thisMonthVolume: number;
}

export interface MonthlyRevenueDto {
  month: number;
  year: number;
  revenue: number;
  volume: number;
  count: number;
}

export interface AdminTransactionDto {
  _id: string;
  leaseId: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  type: string;
  amount: number;
  platformFee: number;
  landlordAmount: number;
  status: string;
  month?: number | undefined;
  year?: number | undefined;
  paidAt?: string | undefined;
  dueDate?: string | undefined;
  createdAt: string;
}

export interface PaginatedTransactionsDto {
  data: AdminTransactionDto[];
  total: number;
  page: number;
  limit: number;
}

export interface GetTransactionsQueryDto {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
}

export interface GetTrendQueryDto {
  months?: number;
}

export interface GetRevenueStatsQueryDto {
  from?: string;
  to?: string;
}
