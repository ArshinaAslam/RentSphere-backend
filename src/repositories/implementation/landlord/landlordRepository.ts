import { FilterQuery } from "mongoose";
import { injectable } from "tsyringe";

import { BaseRepository } from "../../../common/repository/BaseRepository";
import { ILandlord, LandlordModel } from "../../../models/landlordModel";
import { ILandlordRepository } from "../../../repositories/interface/landlord/ILandlordRepository";

import type { Query } from "mongoose";

@injectable()
export class LandlordRepository
  extends BaseRepository<ILandlord>
  implements ILandlordRepository
{
  constructor() {
    super(LandlordModel);
  }

  async findByEmail(email: string): Promise<ILandlord | null> {
    return this.findOne({ email });
  }

  async updateByEmail(
    email: string,
    updateData: Partial<ILandlord>,
  ): Promise<ILandlord | null> {
    const landlord = await this.findByEmail(email);
    if (!landlord) return null;
    return this.update(String(landlord._id), updateData);
  }
  async updateKyc(
    userId: string,
    kycData: Partial<ILandlord>,
  ): Promise<ILandlord | null> {
    return this.model
      .findByIdAndUpdate(userId, kycData, {
        new: true,
      })
      .exec();
  }

  findMany(filter: FilterQuery<ILandlord>): Query<ILandlord[], ILandlord> {
    return this.model.find(filter);
  }

  async count(filter: FilterQuery<ILandlord>): Promise<number> {
    return super.count(filter);
  }

  async updateLandlordById(
    id: string,
    updateData: Partial<ILandlord>,
  ): Promise<ILandlord | null> {
    return this.update(id, updateData);
  }
}
