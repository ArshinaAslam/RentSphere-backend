import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import LeaseModel from "../../models/leaseModel";

import type { ILease, LeaseStatus } from "../../models/leaseModel";
import type { ILeaseRepository } from "../interface/ILeaseRepository";

@injectable()
export class LeaseRepository
  extends BaseRepository<ILease>
  implements ILeaseRepository
{
  constructor() {
    super(LeaseModel);
  }

  async findById(id: string): Promise<ILease | null> {
    return this.model
      .findById(id)
      .populate("propertyId", "title address images city state")
      .populate("landlordId", "firstName lastName email phone")
      .populate("tenantId", "firstName lastName email phone")
      .exec();
  }

  async findByLandlordId(landlordId: string): Promise<ILease[]> {
    return this.model
      .find({ landlordId })
      .populate("propertyId", "title address images")
      .populate("tenantId", "firstName lastName email avatar")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByTenantId(tenantId: string): Promise<ILease[]> {
    return this.model
      .find({ tenantId })
      .populate("propertyId", "title address images")
      .populate("landlordId", "firstName lastName email avatar")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByPropertyId(propertyId: string): Promise<ILease[]> {
    return this.model.find({ propertyId }).sort({ createdAt: -1 }).exec();
  }

  async updateLease(id: string, data: Partial<ILease>): Promise<ILease | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateStatus(
    id: string,
    status: LeaseStatus,
    extra?: Partial<ILease>,
  ): Promise<ILease | null> {
    return this.model
      .findByIdAndUpdate(id, { status, ...extra }, { new: true })
      .exec();
  }

  async deleteLease(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async findLeaseByLandlordId(
    landlordId: string,
    skip: number,
    limit: number,
    search: string = "",
  ): Promise<ILease[]> {
    const query = this._buildSearchQuery(landlordId, search);
    return this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countByLandlordId(
    landlordId: string,
    search: string = "",
  ): Promise<number> {
    const query = this._buildSearchQuery(landlordId, search);
    return this.model.countDocuments(query);
  }

  private _buildSearchQuery(landlordId: string, search: string) {
    const base: Record<string, unknown> = { landlordId };
    if (!search.trim()) return base;

    const q = search.trim();
    return {
      ...base,
      $or: [
        { status: { $regex: q, $options: "i" } },
        { leaseType: { $regex: q, $options: "i" } },
      ],
    };
  }
}
