import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import logger from "../../utils/logger";

import type { AuthRequest } from "../../middleware/auth.middleware";
import type { ILandlordInquiryService } from "../../services/interface/landlord/ILandlordInquiryService";

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
        .json(ApiResponses.error(MESSAGES.INQUIRY.UNAUTHORIZED));
    }

    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 10;
    const search = typeof req.query.search === "string" ? req.query.search : "";

    const result = await this._inquiryService.getLandlordInquiries(landlordId, {
      page,
      limit,
      search,
    });
    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(result, MESSAGES.INQUIRY.FETCH_SUCCESS));
  }

  async markInquiryAsRead(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.INQUIRY.UNAUTHORIZED));
    }
    const { inquiryId } = req.params;
    if (!inquiryId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.INQUIRY.INVALID_ID));
    }

    await this._inquiryService.markAsRead(inquiryId);
    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(null, MESSAGES.INQUIRY.MARK_READ_SUCCESS));
  }
}
