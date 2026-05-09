import { FilterQuery } from "mongoose";
import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import { ILandlord, LandlordModel } from "../../models/landlordModel";
import { ILandlordRepository } from "../interface/ILandlordRepository";

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

  async findPaginated(
    skip: number,
    limit: number,
    search?: string,
    from?: string,
    to?: string,
  ): Promise<ILandlord[]> {
    const filter: FilterQuery<ILandlord> = { role: "LANDLORD" };

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
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countByFilter(
    search?: string,
    from?: string,
    to?: string,
  ): Promise<number> {
    const filter: FilterQuery<ILandlord> = { role: "LANDLORD" };

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
