import { FilterQuery } from "mongoose";
import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import PropertyTypeModel from "../../models/propertyTypeModel";
import { IPropertyTypeRepository } from "../interface/IPropertyTypeRepository";

import type { IPropertyType } from "../../models/propertyTypeModel";

@injectable()
export class PropertyTypeRepository
  extends BaseRepository<IPropertyType>
  implements IPropertyTypeRepository
{
  constructor() {
    super(PropertyTypeModel);
  }

  async findAll(filter?: FilterQuery<IPropertyType>): Promise<IPropertyType[]> {
    return this.model
      .find(filter ?? {})
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPaginated(
    skip: number,
    limit: number,
    search: string = "",
  ): Promise<IPropertyType[]> {
    const filter: FilterQuery<IPropertyType> = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    return this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async countByFilter(search: string = ""): Promise<number> {
    const filter: FilterQuery<IPropertyType> = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    return this.model.countDocuments(filter).exec();
  }

  async findByName(name: string): Promise<IPropertyType | null> {
    return this.model
      .findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })
      .exec();
  }

  async createPropertyType(
    data: Partial<IPropertyType>,
  ): Promise<IPropertyType> {
    return this.create(data);
  }

  async updateById(
    propertyTypeId: string,
    data: Partial<IPropertyType>,
  ): Promise<IPropertyType | null> {
    return this.update(propertyTypeId, data);
  }

  async deleteById(propertyTypeId: string): Promise<void> {
    await this.delete(propertyTypeId);
  }

  async findActive(): Promise<IPropertyType[]> {
    return this.model.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }
}
