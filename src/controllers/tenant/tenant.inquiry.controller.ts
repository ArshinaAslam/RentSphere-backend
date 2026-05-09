import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import { TenantInquiryService } from "../../services/implemenation/tenant/tenant.inquiry.service";
import logger from "../../utils/logger";

import type { CreateInquiryDto } from "../../dto/tenant/tenant.inquiry.dto";
import type { AuthRequest } from "../../middleware/auth.middleware";

@injectable()
export class TenantInquiryController {
  constructor(
    @inject(DI_TYPES.TenantInquiryService)
    private readonly _inquiryService: TenantInquiryService,
  ) {}

  async createInquiry(req: AuthRequest, res: Response): Promise<Response> {
    logger.info("Tenant submitting inquiry");

    const tenantId = req.user?.userId;

    if (!tenantId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.INQUIRY.UNAUTHORIZED));
    }

    const dto = req.body as CreateInquiryDto;

    await this._inquiryService.createInquiry(tenantId, dto);

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponses.success(null, MESSAGES.INQUIRY.CREATE_SUCCESS));
  }

  async getTenantInquiries(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;
    if (!tenantId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.INQUIRY.UNAUTHORIZED));
    }
    const page = Number(req.query.page) || 1;
    const search = (req.query.search as string) ?? "";
    const limit = Number(req.query.limit) || 2;
    const result = await this._inquiryService.getTenantInquiries(
      tenantId,
      page,
      limit,
      search,
    );
    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(result, MESSAGES.INQUIRY.FETCH_SUCCESS));
  }
}
