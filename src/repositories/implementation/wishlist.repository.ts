import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import WishlistModel from "../../models/wishistModel";

import type { IWishlist } from "../../models/wishistModel";
import type { IWishlistRepository } from "../interface/IWishlistRepository";
import type { FilterQuery } from "mongoose";

@injectable()
export class WishlistRepository
  extends BaseRepository<IWishlist>
  implements IWishlistRepository
{
  constructor() {
    super(WishlistModel);
  }

  async add(data: Partial<IWishlist>): Promise<IWishlist> {
    return this.create(data);
  }

  async remove(tenantId: string, propertyId: string): Promise<void> {
    await this.model.deleteOne({
      tenantId,
      propertyId,
    } as FilterQuery<IWishlist>);
  }

  async isWishlisted(data: FilterQuery<IWishlist>): Promise<boolean> {
    const exists = await this.findOne(data);
    return !!exists;
  }

  async findByTenantIdPaginated(
    tenantId: string,
    skip: number,
    limit: number,
  ): Promise<IWishlist[]> {
    return this.model
      .find({ tenantId } as FilterQuery<IWishlist>)
      .populate(
        "propertyId",
        "title address city images price bhk type furnishing bedrooms bathrooms area status",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countByTenantId(tenantId: string): Promise<number> {
    return this.model.countDocuments({ tenantId } as FilterQuery<IWishlist>);
  }
}
