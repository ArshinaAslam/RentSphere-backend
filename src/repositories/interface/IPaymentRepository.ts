import type { IPayment } from "../../models/paymentModel";

export interface IPaymentRepository {
  createPayment(data: Partial<IPayment>): Promise<IPayment>;
  findById(id: string): Promise<IPayment | null>;
  findByTenantId(tenantId: string): Promise<IPayment[]>;
  findByTenantIdPaginated(
    tenantId: string,
    page: number,
    limit: number,
    filters: { search?: string; type?: string; status?: string },
  ): Promise<{ data: IPayment[]; total: number }>;
  findByLeaseId(leaseId: string): Promise<IPayment[]>;
  findByLandlordId(landlordId: string): Promise<IPayment[]>;
  updateStatus(
    id: string,
    status: string,
    extra?: Partial<IPayment>,
  ): Promise<IPayment | null>;
  findByPropertyId(propertyId: string): Promise<IPayment[]>;
  findByLandlordIdAndPropertyId(
    landlordId: string,
    propertyId: string,
  ): Promise<IPayment[]>;
}
