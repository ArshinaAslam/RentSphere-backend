import type { ILease, LeaseStatus } from "../../models/leaseModel";
import type { FilterQuery } from "mongoose";

export interface ILeaseRepository {
  create(data: Partial<ILease>): Promise<ILease>;
  findById(id: string): Promise<ILease | null>;
  findByLandlordId(landlordId: string): Promise<ILease[]>;
  findByTenantId(tenantId: string): Promise<ILease[]>;
  findByPropertyId(
    propertyId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<{ data: ILease[]; total: number }>;
  updateLease(id: string, data: Partial<ILease>): Promise<ILease | null>;
  updateStatus(
    id: string,
    status: LeaseStatus,
    extra?: Partial<ILease>,
  ): Promise<ILease | null>;
  deleteLease(id: string): Promise<void>;
  findLeaseByLandlordId(
    landlordId: string,
    skip: number,
    limit: number,
    search?: string,
  ): Promise<ILease[]>;

  countByLandlordId(landlordId: string, search?: string): Promise<number>;
  //for cron jobs
  find(filter: FilterQuery<ILease>): Promise<ILease[]>;
}
