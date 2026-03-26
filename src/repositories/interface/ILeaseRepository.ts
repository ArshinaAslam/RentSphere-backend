import type { ILease, LeaseStatus } from "../../models/leaseModel";

export interface ILeaseRepository {
  create(data: Partial<ILease>): Promise<ILease>;
  findById(id: string): Promise<ILease | null>;
  findByLandlordId(landlordId: string): Promise<ILease[]>;
  findByTenantId(tenantId: string): Promise<ILease[]>;
  findByPropertyId(propertyId: string): Promise<ILease[]>;
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
}
