import type { SignLeaseDto } from "../../../dto/tenant/tenant.lease.dto";
import type { LeaseResponseDto } from "../../../mappers/lease.mapper";

export interface ITenantLeaseService {
  getTenantLeases(tenantId: string): Promise<LeaseResponseDto[]>;
  getLeaseById(leaseId: string, tenantId: string): Promise<LeaseResponseDto>;
  markAsViewed(leaseId: string, tenantId: string): Promise<LeaseResponseDto>;
  signLease(
    leaseId: string,
    tenantId: string,
    dto: SignLeaseDto,
  ): Promise<LeaseResponseDto>;
}
