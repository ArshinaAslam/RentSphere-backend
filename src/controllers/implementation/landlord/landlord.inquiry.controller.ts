import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";
import type { GetInquiriesParams, ILandlordInquiryService } from "../../../services/interface/landlord/ILandlordInquiryService";
import type { AuthRequest } from "../../../middleware/auth.middleware";
import logger from "../../../utils/logger";

@injectable()
export class LandlordInquiryController {
  constructor(
    @inject(DI_TYPES.LandlordInquiryService)
    private readonly _inquiryService: ILandlordInquiryService,
  ) {}

  async getLandlordInquiries(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    logger.info("Landlord fetching all inquiries");

    const landlordId = req.user?.userId;

    if (!landlordId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated", {}));
    }

   const page   = typeof req.query.page  === 'string' ? Number(req.query.page)  : 1;
    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 10;
    const search = typeof req.query.search === "string" ? req.query.search : "";

    
    const result = await this._inquiryService.getLandlordInquiries(
      landlordId,
      {page,
      limit,
      search}
    );

    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponses(true, "Inquiries fetched successfully", result),
      );
  }
}