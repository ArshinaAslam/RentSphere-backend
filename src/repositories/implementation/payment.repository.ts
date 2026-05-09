import { FilterQuery } from "mongoose";
import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import { RevenueStatsDto } from "../../dto/admin/admin.revenue.dto";
import PaymentModel from "../../models/paymentModel";
import { TrendResult } from "../../services/interface/admin/IAdminRevenueService";

import type { IPayment } from "../../models/paymentModel";
import type { IPaymentRepository } from "../interface/IPaymentRepository";

@injectable()
export class PaymentRepository
  extends BaseRepository<IPayment>
  implements IPaymentRepository
{
  constructor() {
    super(PaymentModel);
  }

  async createPayment(data: Partial<IPayment>): Promise<IPayment> {
    return this.create(data);
  }

  async findByTenantId(tenantId: string): Promise<IPayment[]> {
    return this.model.find({ tenantId }).sort({ createdAt: -1 }).exec();
  }

  async findByTenantIdPaginated(
    tenantId: string,
    page: number,
    limit: number,
    filters: { search?: string; type?: string; status?: string },
  ): Promise<{ data: IPayment[]; total: number }> {
    const query: FilterQuery<IPayment> = { tenantId };

    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;

    if (filters.search) {
      query.type = { $regex: filters.search, $options: "i" };
    }

    const [data, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async findByLeaseId(leaseId: string): Promise<IPayment[]> {
    return this.model.find({ leaseId }).sort({ createdAt: -1 }).exec();
  }

  async findByLandlordId(landlordId: string): Promise<IPayment[]> {
    return this.model
      .find({ landlordId })
      .populate("tenantId", "firstName lastName")
      .populate("propertyId", "title")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByPropertyAndTenant(
    propertyId: string,
    tenantId: string,
    page: number,
    limit: number,
    type?: string,
    status?: string,
  ): Promise<{ data: IPayment[]; total: number }> {
    const query: Record<string, unknown> = { propertyId, tenantId };
    if (type) query.type = type;
    if (status) query.status = status;

    const [data, total] = await Promise.all([
      this.model
        .find(query)
        .populate("tenantId", "firstName lastName email avatar")
        .populate("landlordId", "firstName lastName email avatar")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);
    return { data, total };
  }

  async updateStatus(
    id: string,
    status: string,
    extra?: Partial<IPayment>,
  ): Promise<IPayment | null> {
    return this.model
      .findByIdAndUpdate(id, { status, ...extra }, { new: true })
      .exec();
  }

  async findByPropertyId(
    propertyId: string,
    page: number,
    limit: number,
    type?: string,
    status?: string,
  ): Promise<{ data: IPayment[]; total: number }> {
    const query: Record<string, unknown> = { propertyId };
    if (type) query.type = type;
    if (status) query.status = status;

    const [data, total] = await Promise.all([
      this.model
        .find(query)
        .populate("tenantId", "firstName lastName email avatar")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);
    return { data, total };
  }

  async findByLandlordIdAndPropertyId(
    landlordId: string,
    propertyId: string,
  ): Promise<IPayment[]> {
    return this.model
      .find({ landlordId, propertyId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPaymentById(paymentId: string): Promise<IPayment | null> {
    return this.model
      .findById(paymentId)
      .populate("tenantId", "firstName lastName email phone avatar")
      .populate("propertyId", "title address city state images")
      .exec();
  }

  async findByLandlordIdPaginated(
    landlordId: string,
    page: number,
    limit: number,
    filters: { search?: string; type?: string; status?: string },
  ): Promise<{ data: IPayment[]; total: number }> {
    const query: FilterQuery<IPayment> = { landlordId };

    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.search) query.type = { $regex: filters.search, $options: "i" };

    const [data, total] = await Promise.all([
      this.model
        .find(query)
        .populate("tenantId", "firstName lastName")
        .populate("propertyId", "title")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async getAdminRevenueStats(dateFilter?: {
    from: Date;
    to: Date;
  }): Promise<RevenueStatsDto> {
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    const matchBase: Record<string, unknown> = { status: "completed" };
    if (dateFilter) {
      matchBase.paidAt = { $gte: dateFilter.from, $lte: dateFilter.to };
    }

    interface OverallResult {
      totalRevenue: number;
      totalVolume: number;
      totalCount: number;
      depositRevenue: number;
      rentRevenue: number;
    }
    interface ThisMonthResult {
      thisMonthRevenue: number;
      thisMonthVolume: number;
    }

    const overallResults = await this.model.aggregate<OverallResult>([
      { $match: matchBase },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$platformFee" },
          totalVolume: { $sum: "$amount" },
          totalCount: { $sum: 1 },
          depositRevenue: {
            $sum: { $cond: [{ $eq: ["$type", "deposit"] }, "$platformFee", 0] },
          },
          rentRevenue: {
            $sum: { $cond: [{ $eq: ["$type", "rent"] }, "$platformFee", 0] },
          },
        },
      },
    ]);

    const thisMonthResults = await this.model.aggregate<ThisMonthResult>([
      {
        $match: {
          status: "completed",
          $or: [
            { month: thisMonth, year: thisYear },
            {
              paidAt: {
                $gte: new Date(thisYear, thisMonth - 1, 1),
                $lt: new Date(thisYear, thisMonth, 1),
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          thisMonthRevenue: { $sum: "$platformFee" },
          thisMonthVolume: { $sum: "$amount" },
        },
      },
    ]);

    const overall = overallResults[0];
    const thisMonthData = thisMonthResults[0];

    return {
      totalRevenue: overall?.totalRevenue ?? 0,
      totalVolume: overall?.totalVolume ?? 0,
      totalCount: overall?.totalCount ?? 0,
      depositRevenue: overall?.depositRevenue ?? 0,
      rentRevenue: overall?.rentRevenue ?? 0,
      thisMonthRevenue: thisMonthData?.thisMonthRevenue ?? 0,
      thisMonthVolume: thisMonthData?.thisMonthVolume ?? 0,
    };
  }

  async getMonthlyRevenueTrend(months: number = 6): Promise<TrendResult[]> {
    const results = await this.model.aggregate<TrendResult>([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          revenue: { $sum: "$platformFee" },
          volume: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: months },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return results;
  }

  async getAllPaymentsPaginated(
    page: number,
    limit: number,
    filters: { type?: string; status?: string; search?: string },
  ): Promise<{ data: IPayment[]; total: number }> {
    const query: FilterQuery<IPayment> = {};

    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;

    if (filters.search) {
      const regex = { $regex: filters.search, $options: "i" };
      query.$or = [{ razorpayOrderId: regex }, { razorpayPaymentId: regex }];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return { data: data, total };
  }
}
