import { FilterQuery } from "mongoose";
import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import AmenityModel from "../../models/amenityModel";
import { IAmenityRepository } from "../interface/IAmenityRepository";

import type { IAmenity } from "../../models/amenityModel";

@injectable()
export class AmenityRepository
  extends BaseRepository<IAmenity>
  implements IAmenityRepository
{
  constructor() {
    super(AmenityModel);
  }

  async findPaginated(
    skip: number,
    limit: number,
    search: string = "",
  ): Promise<IAmenity[]> {
    const filter: FilterQuery<IAmenity> = {};
    if (search) {
      filter.label = { $regex: search, $options: "i" };
    }
    return this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async countByFilter(search: string = ""): Promise<number> {
    const filter: FilterQuery<IAmenity> = {};
    if (search) {
      filter.label = { $regex: search, $options: "i" };
    }
    return this.model.countDocuments(filter).exec();
  }

  async findByLabel(label: string): Promise<IAmenity | null> {
    return this.model
      .findOne({ label: { $regex: new RegExp(`^${label}$`, "i") } })
      .exec();
  }

  async createAmenity(data: Partial<IAmenity>): Promise<IAmenity> {
    return this.create(data);
  }

  async updateById(
    id: string,
    data: Partial<IAmenity>,
  ): Promise<IAmenity | null> {
    return this.update(id, data);
  }

  async deleteById(id: string): Promise<void> {
    await this.delete(id);
  }

  async findActive(): Promise<IAmenity[]> {
    return this.model.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }
}
