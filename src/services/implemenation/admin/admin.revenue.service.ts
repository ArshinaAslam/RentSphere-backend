import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { PaymentMapper } from "../../../mappers/payment.mapper";
import { IPaymentRepository } from "../../../repositories/interface/IPaymentRepository";
import logger from "../../../utils/logger";
import { IAdminRevenueService } from "../../interface/admin/IAdminRevenueService";

import type {
  RevenueStatsDto,
  MonthlyRevenueDto,
  PaginatedTransactionsDto,
  GetTransactionsQueryDto,
  GetTrendQueryDto,
  GetRevenueStatsQueryDto,
} from "../../../dto/admin/admin.revenue.dto";

@injectable()
export default class AdminRevenueService implements IAdminRevenueService {
  constructor(
    @inject(DI_TYPES.PaymentRepository)
    private readonly _paymentRepo: IPaymentRepository,
  ) {}

  async getRevenueStats(
    query?: GetRevenueStatsQueryDto,
  ): Promise<RevenueStatsDto> {
    let dateFilter: { from: Date; to: Date } | undefined;

    if (query?.from && query?.to) {
      dateFilter = { from: new Date(query.from), to: new Date(query.to) };
    }

    logger.info("Fetching admin revenue stats", { dateFilter });
    return this._paymentRepo.getAdminRevenueStats(dateFilter);
  }

  async getMonthlyTrend(query: GetTrendQueryDto): Promise<MonthlyRevenueDto[]> {
    const months = Number(query.months) || 6;
    const results = await this._paymentRepo.getMonthlyRevenueTrend(months);

    return results.map(
      (r): MonthlyRevenueDto => ({
        month: r._id.month,
        year: r._id.year,
        revenue: r.revenue,
        volume: r.volume,
        count: r.count,
      }),
    );
  }

  async getAllTransactions(
    query: GetTransactionsQueryDto,
  ): Promise<PaginatedTransactionsDto> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const filters: { type?: string; status?: string; search?: string } = {};
    if (query.type) filters.type = query.type;
    if (query.status) filters.status = query.status;
    if (query.search) filters.search = query.search;

    logger.info("Fetching all transactions for admin", {
      page,
      limit,
      filters,
    });

    const { data, total } = await this._paymentRepo.getAllPaymentsPaginated(
      page,
      limit,
      filters,
    );

    logger.info("Transactions fetched", { total, page });

    return {
      data: PaymentMapper.toDtoList(data),
      total,
      page,
      limit,
    };
  }
}
