import type { RevenueStatsDto } from "../../dto/admin/admin.revenue.dto";
import type { IPayment } from "../../models/paymentModel";
import type { TrendResult } from "../../services/interface/admin/IAdminRevenueService";

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
  findByPropertyId(
    propertyId: string,
    page: number,
    limit: number,
    type?: string,
    status?: string,
  ): Promise<{ data: IPayment[]; total: number }>;
  findByLandlordIdAndPropertyId(
    landlordId: string,
    propertyId: string,
  ): Promise<IPayment[]>;
  findPaymentById(paymentId: string): Promise<IPayment | null>;
  findByLandlordIdPaginated(
    landlordId: string,
    page: number,
    limit: number,
    filters: { search?: string; type?: string; status?: string },
  ): Promise<{ data: IPayment[]; total: number }>;

  findByPropertyAndTenant(
    propertyId: string,
    tenantId: string,
    page: number,
    limit: number,
    type?: string,
    status?: string,
  ): Promise<{ data: IPayment[]; total: number }>;

  //admin
  getAdminRevenueStats(dateFilter?: {
    from: Date;
    to: Date;
  }): Promise<RevenueStatsDto>;
  getMonthlyRevenueTrend(months: number): Promise<TrendResult[]>;
  getAllPaymentsPaginated(
    page: number,
    limit: number,
    filters: { type?: string; status?: string; search?: string },
  ): Promise<{ data: IPayment[]; total: number }>;
}
