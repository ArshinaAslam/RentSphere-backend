import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import VisitBookingModel from "../../models/visitBookingModel";

import type { IVisitBooking } from "../../models/visitBookingModel";
import type { IVisitBookingRepository } from "../interface/IVisitBookingRepository";
import type { FilterQuery } from "mongoose";

@injectable()
export class VisitBookingRepository
  extends BaseRepository<IVisitBooking>
  implements IVisitBookingRepository
{
  constructor() {
    super(VisitBookingModel);
  }

  async findBookedSlots(propertyId: string, date: string): Promise<string[]> {
    const bookings = await this.model
      .find({
        propertyId,
        date,
        status: { $ne: "cancelled" },
      } as FilterQuery<IVisitBooking>)
      .select("timeSlot")
      .exec();

    return bookings.map((b) => String(b.timeSlot));
  }

  async findExistingBooking(
    propertyId: string,
    date: string,
    timeSlot: string,
  ): Promise<IVisitBooking | null> {
    return this.findOne({
      propertyId,
      date,
      timeSlot,
      status: { $ne: "cancelled" },
    } as FilterQuery<IVisitBooking>);
  }

  async createSlot(data: Partial<IVisitBooking>): Promise<IVisitBooking> {
    return this.model.create(data);
  }

  async findByTenantId(tenantId: string): Promise<IVisitBooking[]> {
    return this.model
      .find({ tenantId } as FilterQuery<IVisitBooking>)
      .populate("propertyId", "title address city images")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findTenantBookingForProperty(
    tenantId: string,
    propertyId: string,
    date: string,
  ): Promise<IVisitBooking | null> {
    return this.findOne({
      tenantId,
      propertyId,
      date,
      status: { $ne: "cancelled" },
    } as FilterQuery<IVisitBooking>);
  }

  async findByLandlordId(
    landlordId: string,
    skip: number,
    limit: number,
    search: string,
  ): Promise<IVisitBooking[]> {
    const query = this._buildQuery(landlordId, search);
    return this.model
      .find(query)
      .populate("propertyId", "title address city images")
      .populate("tenantId", "firstName lastName email phone avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countByLandlordId(landlordId: string, search: string): Promise<number> {
    const query = this._buildQuery(landlordId, search);
    return this.model.countDocuments(query);
  }

  private _buildQuery(landlordId: string, search: string) {
    const base: Record<string, unknown> = { landlordId };
    if (!search.trim()) return base;
    const q = search.trim();
    return {
      ...base,
      $or: [
        { status: { $regex: q, $options: "i" } },
        { date: { $regex: q, $options: "i" } },
        { timeSlot: { $regex: q, $options: "i" } },
      ],
    };
  }

  async updateStatus(
    visitId: string,
    status: string,
  ): Promise<IVisitBooking | null> {
    return this.update(visitId, { status } as Partial<IVisitBooking>);
  }
}
