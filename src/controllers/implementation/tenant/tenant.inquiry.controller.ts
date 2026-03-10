import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";
import { TenantInquiryService } from "../../../services/implemenation/tenant/tenant.inquiry.service";
import logger from "../../../utils/logger";

import type { CreateInquiryDto } from "../../../dto/tenant/tenant.inquiry.dto";
import type { AuthRequest } from "../../../middleware/auth.middleware";

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
        .json(new ApiResponses(false, "User not authenticated", {}));
    }

    const dto = req.body as CreateInquiryDto;

    await this._inquiryService.createInquiry(tenantId, dto);

    return res
      .status(HttpStatus.CREATED)
      .json(new ApiResponses(true, "Inquiry submitted successfully", {}));
  }
}
