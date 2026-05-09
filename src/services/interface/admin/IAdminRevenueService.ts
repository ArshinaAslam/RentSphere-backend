import type {
  RevenueStatsDto,
  MonthlyRevenueDto,
  PaginatedTransactionsDto,
  GetTransactionsQueryDto,
  GetTrendQueryDto,
  GetRevenueStatsQueryDto,
} from "../../../dto/admin/admin.revenue.dto";

export interface TrendResult {
  _id: { year: number; month: number };
  revenue: number;
  volume: number;
  count: number;
}

export interface IAdminRevenueService {
  getRevenueStats(query?: GetRevenueStatsQueryDto): Promise<RevenueStatsDto>;
  getMonthlyTrend(query: GetTrendQueryDto): Promise<MonthlyRevenueDto[]>;
  getAllTransactions(
    query: GetTransactionsQueryDto,
  ): Promise<PaginatedTransactionsDto>;
}
