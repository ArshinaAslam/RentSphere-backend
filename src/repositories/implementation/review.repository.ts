import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import { ReviewModel, IReview } from "../../models/reviewModel";
import { IReviewRepository } from "../interface/IReviewRepository";

@injectable()
export class ReviewRepository
  extends BaseRepository<IReview>
  implements IReviewRepository
{
  constructor() {
    super(ReviewModel);
  }

  async createReview(dto: Partial<IReview>): Promise<IReview> {
    return this.create(dto);
  }

  async findByTenantAndProperty(
    tenantId: string,
    propertyId: string,
  ): Promise<IReview | null> {
    return this.model.findOne({ tenantId, propertyId }).exec();
  }

  async findByPropertyId(
    propertyId: string,
    page: number,
    limit: number,
  ): Promise<{ data: IReview[]; total: number }> {
    const [data, total] = await Promise.all([
      this.model
        .find({ propertyId })
        .populate("tenantId", "firstName lastName avatar")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments({ propertyId }).exec(),
    ]);
    return { data, total };
  }
}
