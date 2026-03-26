import type { LeaseResponseDto } from "../../mappers/lease.mapper";

export interface CreateLeaseDto {
  propertyId: string;
  tenantId: string;
  rentAmount: number;
  securityDeposit: number;
  paymentDueDay: number;
  lateFee?: number;
  startDate: string;
  endDate: string;
  leaseType: "fixed" | "monthly";
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  maxOccupants?: number;
  noticePeriod?: number;
  utilitiesIncluded?: string[];
  termsAndConditions?: string;
}

export interface UpdateLeaseDto {
  rentAmount?: number;
  securityDeposit?: number;
  paymentDueDay?: number;
  lateFee?: number;
  startDate?: string;
  endDate?: string;
  leaseType?: "fixed" | "monthly";
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  maxOccupants?: number;
  noticePeriod?: number;
  utilitiesIncluded?: string[];
  termsAndConditions?: string;
}

export interface TenantSearchResultDto {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string | undefined;
}

export interface LandlordPropertyDto {
  _id: string;
  title: string;
  city: string;
  state: string;
  images: string[];
  price: number;
  status: string;
}

export interface GetLeasesResultDto {
  leases: LeaseResponseDto[];
  total: number;
  page: number;
  totalPages: number;
}

export interface signLandlordLeaseDto {
  signatureName: string;
}
