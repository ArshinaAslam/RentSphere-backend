import { FilterQuery } from "mongoose";
import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import propertyModel, { IProperty } from "../../models/propertyModel";
import { IPropertyRepository } from "../interface/IPropertyRepository";

@injectable()
export class PropertyRepository
  extends BaseRepository<IProperty>
  implements IPropertyRepository
{
  constructor() {
    super(propertyModel);
  }

  async createProperty(data: Partial<IProperty>): Promise<IProperty> {
    return this.create(data);
  }

  async findByLandlordId(
    landlordId: string,
    skip: number,
    limit: number,
    search: string = "",
  ): Promise<IProperty[]> {
    const filter: FilterQuery<IProperty> = { landlordId };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    return this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async countByLandlordId(
    landlordId: string,
    search: string = "",
  ): Promise<number> {
    const filter: FilterQuery<IProperty> = { landlordId };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    return this.count(filter);
  }

  async findPropertyById(propertyId: string): Promise<IProperty | null> {
    return this.findById(propertyId);
  }

  async deletePropertyById(propertyId: string): Promise<void> {
    await this.delete(propertyId);
  }

  async updateProperty(
    propertyId: string,
    updateData: Partial<IProperty>,
  ): Promise<IProperty | null> {
    return this.update(propertyId, updateData);
  }

  async findAllAvailable(params: {
    skip: number;
    limit: number;
    search?: string;
    bhk?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<IProperty[]> {
    const filter: FilterQuery<IProperty> = { status: "Available" };

    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: "i" } },
        { address: { $regex: params.search, $options: "i" } },
        { city: { $regex: params.search, $options: "i" } },
      ];
    }

    if (params.bhk) filter.bhk = params.bhk;
    if (params.type) filter.type = params.type;

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      filter.price = {
        ...(params.minPrice !== undefined && { $gte: params.minPrice }),
        ...(params.maxPrice !== undefined && { $lte: params.maxPrice }),
      };
    }

    return this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(params.skip)
      .limit(params.limit)
      .exec();
  }

  async countAllAvailable(params: {
    search?: string;
    bhk?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<number> {
    const filter: FilterQuery<IProperty> = { status: "Available" };

    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: "i" } },
        { city: { $regex: params.search, $options: "i" } },
      ];
    }

    if (params.bhk) filter.bhk = params.bhk;
    if (params.type) filter.type = params.type;

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      filter.price = {
        ...(params.minPrice !== undefined && { $gte: params.minPrice }),
        ...(params.maxPrice !== undefined && { $lte: params.maxPrice }),
      } as unknown as number;
    }

    return this.count(filter);
  }

  async findTenantPropertyById(propertyId: string): Promise<IProperty | null> {
    return this.model
      .findById(propertyId)
      .populate({
        path: "landlordId",
        select:
          "firstName lastName fullName email phone profileImage kycStatus createdAt",
      })
      .lean();
  }

  async findAllPropertyByLandlordId(landlordId: string): Promise<IProperty[]> {
    return this.model
      .find({ landlordId } as FilterQuery<IProperty>)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllForAdmin(params: {
    skip: number;
    limit: number;
    from?: string;
    to?: string;
  }): Promise<IProperty[]> {
    const filter: FilterQuery<IProperty> = {};

    if (params.from && params.to) {
      filter.createdAt = {
        $gte: new Date(params.from),
        $lte: new Date(params.to),
      };
    }

    return this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(params.skip)
      .limit(params.limit)
      .lean()
      .exec();
  }

  async countAllForAdmin(params: {
    from?: string;
    to?: string;
  }): Promise<number> {
    const filter: FilterQuery<IProperty> = {};

    if (params.from && params.to) {
      filter.createdAt = {
        $gte: new Date(params.from),
        $lte: new Date(params.to),
      };
    }

    return this.count(filter);
  }
}
