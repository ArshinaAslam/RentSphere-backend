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

  // async count(filter: FilterQuery<ITenant>): Promise<number> {
  //   return this.count(filter);
  // }

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
}
