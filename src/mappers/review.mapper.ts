import type { ReviewResponseDto } from "../dto/tenant/tenant.review.dto";
import type { IReview } from "../models/reviewModel";

export class ReviewMapper {
  static toResponseDto(review: IReview): ReviewResponseDto {
    const tenant = review.tenantId as unknown;
    const isPopulated = (
      val: unknown,
    ): val is { _id: string; firstName?: string; lastName?: string } =>
      typeof val === "object" && val !== null && "_id" in val;

    const tenantName = isPopulated(tenant)
      ? `${tenant.firstName ?? ""} ${tenant.lastName ?? ""}`.trim()
      : "";
    return {
      id: String(review._id),
      tenantId: isPopulated(tenant)
        ? String(tenant._id)
        : String(review.tenantId),
      tenantName,
      propertyId: String(review.propertyId),
      leaseId: String(review.leaseId),
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }

  static toResponseDtoList(reviews: IReview[]): ReviewResponseDto[] {
    return reviews.map((r) => this.toResponseDto(r));
  }
}
