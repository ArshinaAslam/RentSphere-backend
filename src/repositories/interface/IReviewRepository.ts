import type { IBaseRepository } from "../../common/repository/IBaseRepository";
import type { IReview } from "../../models/reviewModel";

export interface IReviewRepository extends IBaseRepository<IReview> {
  createReview(dto: Partial<IReview>): Promise<IReview>;
  findByTenantAndProperty(
    tenantId: string,
    propertyId: string,
  ): Promise<IReview | null>;
  findByPropertyId(
    propertyId: string,
    page: number,
    limit: number,
  ): Promise<{ data: IReview[]; total: number }>;
}
