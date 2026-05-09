import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import { IAdminRevenueService } from "../../services/interface/admin/IAdminRevenueService";
import logger from "../../utils/logger";
@injectable()
export class AdminRevenueController {
  constructor(
    @inject(DI_TYPES.AdminRevenueService)
    private readonly _revenueService: IAdminRevenueService,
  ) {}

  async getRevenueStats(req: Request, res: Response): Promise<Response> {
    const { from, to } = req.query as { from?: string; to?: string };

    const data = await this._revenueService.getRevenueStats(
      from && to ? { from, to } : undefined,
    );

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(data, MESSAGES.REVENUE.STATS_SUCCESS));
  }

  async getMonthlyTrend(req: Request, res: Response): Promise<Response> {
    const months = Number(req.query.months) || 6;

    logger.info("Admin get monthly trend request", { months, ip: req.ip });

    const data = await this._revenueService.getMonthlyTrend({ months });

    logger.info("Admin monthly trend SUCCESS", { count: data.length });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(data, MESSAGES.REVENUE.TREND_SUCCESS));
  }

  async getAllTransactions(req: Request, res: Response): Promise<Response> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    logger.info("Admin get all transactions request", {
      page,
      limit,
      type,
      status,
    });

    const data = await this._revenueService.getAllTransactions({
      page,
      limit,
      ...(type && { type }),
      ...(status && { status }),
      ...(search && { search }),
    });

    logger.info("Admin transactions SUCCESS", { total: data.total });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(data, MESSAGES.REVENUE.TRANSACTIONS_SUCCESS));
  }
}
