import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { AppError } from "../../common/errors/appError";
import { ApiResponses } from "../../common/response/ApiResponse";
import { SubmitReviewDto } from "../../dto/tenant/tenant.review.dto";
import { AuthRequest } from "../../middleware/auth.middleware";
import { ITenantReviewService } from "../../services/interface/tenant/ITenantReviewService";
import logger from "../../utils/logger";

@injectable()
export class TenantReviewController {
  constructor(
    @inject(DI_TYPES.TenantReviewService)
    private readonly _reviewService: ITenantReviewService,
  ) {}

  async submitReview(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;
    if (!tenantId) {
      throw new AppError(MESSAGES.REVIEW.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const { propertyId, leaseId, rating, comment } =
      req.body as SubmitReviewDto;

    logger.info("Review submit START", { tenantId, propertyId });

    const review = await this._reviewService.submitReview({
      tenantId,
      propertyId,
      leaseId,
      rating,
      comment,
    });

    logger.info("Review submit SUCCESS", { tenantId, propertyId });

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponses.success({ review }, MESSAGES.REVIEW.SUBMITTED));
  }

  async getMyReview(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;
    const { propertyId } = req.params;

    if (!tenantId)
      throw new AppError(MESSAGES.REVIEW.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);

    if (!propertyId) {
      throw new AppError(
        MESSAGES.REVIEW.PROPERTY_ID_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const review = await this._reviewService.getMyReview(tenantId, propertyId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success({ review }, MESSAGES.REVIEW.FETCHED));
  }
}
