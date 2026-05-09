import { FilterQuery, Query } from "mongoose";
import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import { ITenant, TenantModel } from "../../models/tenantModel";
import { ITenantRepository } from "../interface/ITenantRepository";

@injectable()
export class TenantRepository
  extends BaseRepository<ITenant>
  implements ITenantRepository
{
  constructor() {
    super(TenantModel);
  }

  async findByEmail(email: string): Promise<ITenant | null> {
    return this.findOne({ email } as FilterQuery<ITenant>);
  }

  async updateByEmail(
    email: string,
    updateData: Partial<ITenant>,
  ): Promise<ITenant | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    return this.update(String(user._id), updateData);
  }

  findMany(filter: FilterQuery<ITenant>): Query<ITenant[], ITenant> {
    return this.model.find(filter);
  }

  async count(filter: FilterQuery<ITenant>): Promise<number> {
    return super.count(filter);
  }

  async updateUserById(
    id: string,
    updateData: Partial<ITenant>,
  ): Promise<ITenant | null> {
    return this.update(id, updateData);
  }

  async searchByQuery(query: string, tenantIds: string[]): Promise<ITenant[]> {
    return this.model
      .find({
        _id: { $in: tenantIds },
        $or: [
          { phone: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { firstName: { $regex: query, $options: "i" } },
          { lastName: { $regex: query, $options: "i" } },
        ],
      })
      .select("firstName lastName email phone avatar")
      .limit(10)
      .exec();
  }

  async findPaginated(
    skip: number,
    limit: number,
    search: string,
    from?: string,
    to?: string,
  ): Promise<ITenant[]> {
    const filter: FilterQuery<ITenant> = { role: "TENANT" };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    return this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countBySearch(
    search: string = "",
    from?: string,
    to?: string,
  ): Promise<number> {
    const filter: FilterQuery<ITenant> = {};

    if (search?.trim()) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (from && to) {
      filter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    return this.model.countDocuments(filter).exec();
  }
}
