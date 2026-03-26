import { FilterQuery } from "mongoose";
import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import PaymentModel from "../../models/paymentModel";

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
    return this.model.find({ landlordId }).sort({ createdAt: -1 }).exec();
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

  async findByPropertyId(propertyId: string): Promise<IPayment[]> {
    return this.model.find({ propertyId }).sort({ createdAt: -1 }).exec();
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
}
