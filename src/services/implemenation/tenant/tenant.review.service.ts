import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import {
  ReviewResponseDto,
  SubmitReviewDto,
} from "../../../dto/tenant/tenant.review.dto";
import { ReviewMapper } from "../../../mappers/review.mapper";
import { ILeaseRepository } from "../../../repositories/interface/ILeaseRepository";
import { IReviewRepository } from "../../../repositories/interface/IReviewRepository";
import { ITenantReviewService } from "../../interface/tenant/ITenantReviewService";

@injectable()
export class TenantReviewService implements ITenantReviewService {
  constructor(
    @inject(DI_TYPES.ReviewRepository)
    private readonly _reviewRepo: IReviewRepository,
    @inject(DI_TYPES.LeaseRepository)
    private readonly _leaseRepo: ILeaseRepository,
  ) {}

  async submitReview(
    dto: SubmitReviewDto & { tenantId: string },
  ): Promise<ReviewResponseDto> {
    const lease = await this._leaseRepo.findById(dto.leaseId);
    if (!lease) {
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const leaseTenantId =
      typeof lease.tenantId === "object" &&
      lease.tenantId !== null &&
      "_id" in lease.tenantId
        ? String((lease.tenantId as { _id: string })._id)
        : String(lease.landlordId);

    if (leaseTenantId !== dto.tenantId)
      throw new AppError(MESSAGES.LEASE.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    if (lease.status !== "active") {
      throw new AppError(
        MESSAGES.REVIEW.LEASE_NOT_ACTIVE,
        HttpStatus.FORBIDDEN,
      );
    }

    const existing = await this._reviewRepo.findByTenantAndProperty(
      dto.tenantId,
      dto.propertyId,
    );
    if (existing) {
      throw new AppError(MESSAGES.REVIEW.ALREADY_REVIEWED, HttpStatus.CONFLICT);
    }

    const review = await this._reviewRepo.createReview(dto);
    return ReviewMapper.toResponseDto(review);
  }

  async getMyReview(
    tenantId: string,
    propertyId: string,
  ): Promise<ReviewResponseDto | null> {
    const review = await this._reviewRepo.findByTenantAndProperty(
      tenantId,
      propertyId,
    );
    if (!review) return null;
    return ReviewMapper.toResponseDto(review);
  }
}
