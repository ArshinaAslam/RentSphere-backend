import type {
  CreateLeaseDto,
  GetLeasesResultDto,
  LandlordPropertyDto,
  signLandlordLeaseDto,
  TenantSearchResultDto,
  UpdateLeaseDto,
} from "../../../dto/landlord/landlord.lease.dto";
import type { LeaseResponseDto } from "../../../mappers/lease.mapper";

export interface ILandlordLeaseService {
  createLease(
    dto: CreateLeaseDto,
    landlordId: string,
  ): Promise<LeaseResponseDto>;
  updateLease(
    leaseId: string,
    dto: UpdateLeaseDto,
    landlordId: string,
  ): Promise<LeaseResponseDto>;
  sendLease(leaseId: string, landlordId: string): Promise<LeaseResponseDto>;
  // getLandlordLeases(landlordId: string): Promise<LeaseResponseDto[]>;
  getLandlordLeases(
    landlordId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<GetLeasesResultDto>;
  getLeaseById(leaseId: string, landlordId: string): Promise<LeaseResponseDto>;
  terminateLease(
    leaseId: string,
    landlordId: string,
  ): Promise<LeaseResponseDto>;
  deleteLease(leaseId: string, landlordId: string): Promise<void>;
  signLease(
    leaseId: string,
    landlordId: string,
    dto: signLandlordLeaseDto,
  ): Promise<LeaseResponseDto>;
  searchTenants(
    query: string,
    landlordId: string,
  ): Promise<TenantSearchResultDto[]>;
  getLandlordProperties(landlordId: string): Promise<LandlordPropertyDto[]>;
}
