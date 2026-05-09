import type {
  ReviewResponseDto,
  SubmitReviewDto,
} from "../../../dto/tenant/tenant.review.dto";

export interface ITenantReviewService {
  submitReview(
    dto: SubmitReviewDto & { tenantId: string },
  ): Promise<ReviewResponseDto>;
  getMyReview(
    tenantId: string,
    propertyId: string,
  ): Promise<ReviewResponseDto | null>;
}
