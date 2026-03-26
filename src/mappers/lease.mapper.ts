import type {
  LandlordPropertyDto,
  TenantSearchResultDto,
} from "../dto/landlord/landlord.lease.dto";
import type { ILease } from "../models/leaseModel";
import type { IProperty } from "../models/propertyModel";
import type { ITenant } from "../models/tenantModel";
interface PopulatedParty {
  _id: unknown;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface PopulatedProperty {
  _id: unknown;
  title?: string;
  address?: string;
  city?: string;
  state?: string;
  images?: string[];
}

const isPopulatedParty = (val: unknown): val is PopulatedParty =>
  typeof val === "object" && val !== null && "_id" in val && "firstName" in val;

const isPopulatedProperty = (val: unknown): val is PopulatedProperty =>
  typeof val === "object" && val !== null && "_id" in val && "title" in val;

export interface LeaseResponseDto {
  _id: string;
  propertyId:
    | string
    | {
        _id: string;
        title: string;
        address: string;
        city: string;
        state: string;
        images: string[];
      };
  landlordId:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        avatar?: string;
      };
  tenantId:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        avatar?: string;
      };
  rentAmount: number;
  securityDeposit: number;
  paymentDueDay: number;
  lateFee: number;
  startDate: string;
  endDate: string;
  leaseType: string;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  maxOccupants: number;
  noticePeriod: number;
  utilitiesIncluded: string[];
  termsAndConditions: string;
  status: string;
  tenantSignature?: { name: string; signedAt: string } | undefined;
  landlordSignature?: { name: string; signedAt: string } | undefined;
  sentAt?: string | undefined;
  viewedAt?: string | undefined;
  signedAt?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export class LeaseMapper {
  static toDto(lease: ILease): LeaseResponseDto {
    const mapParty = (val: unknown) => {
      if (isPopulatedParty(val)) {
        return {
          _id: String(val._id),
          firstName: val.firstName ?? "",
          lastName: val.lastName ?? "",
          email: val.email ?? "",
          phone: val.phone ?? "",
          ...(val.avatar && { avatar: val.avatar }),
        };
      }
      return String(val);
    };

    const mapProperty = (val: unknown) => {
      if (isPopulatedProperty(val)) {
        return {
          _id: String(val._id),
          title: val.title ?? "",
          address: val.address ?? "",
          city: val.city ?? "",
          state: val.state ?? "",
          images: val.images ?? [],
        };
      }
      return String(val);
    };
    return {
      _id: String(lease._id),
      propertyId: mapProperty(lease.propertyId as unknown),
      landlordId: mapParty(lease.landlordId as unknown),
      tenantId: mapParty(lease.tenantId as unknown),
      rentAmount: lease.rentAmount,
      securityDeposit: lease.securityDeposit,
      paymentDueDay: lease.paymentDueDay,
      lateFee: lease.lateFee,
      startDate: new Date(lease.startDate).toISOString(),
      endDate: new Date(lease.endDate).toISOString(),
      leaseType: lease.leaseType,
      petsAllowed: lease.petsAllowed,
      smokingAllowed: lease.smokingAllowed,
      maxOccupants: lease.maxOccupants,
      noticePeriod: lease.noticePeriod,
      utilitiesIncluded: lease.utilitiesIncluded,
      termsAndConditions: lease.termsAndConditions,
      status: lease.status,
      tenantSignature: lease.tenantSignature
        ? {
            name: lease.tenantSignature.name,
            signedAt: new Date(lease.tenantSignature.signedAt).toISOString(),
          }
        : undefined,
      landlordSignature: lease.landlordSignature
        ? {
            name: lease.landlordSignature.name,
            signedAt: new Date(lease.landlordSignature.signedAt).toISOString(),
          }
        : undefined,
      sentAt: lease.sentAt ? new Date(lease.sentAt).toISOString() : undefined,
      viewedAt: lease.viewedAt
        ? new Date(lease.viewedAt).toISOString()
        : undefined,
      signedAt: lease.signedAt
        ? new Date(lease.signedAt).toISOString()
        : undefined,
      createdAt: new Date(lease.createdAt).toISOString(),
      updatedAt: new Date(lease.updatedAt).toISOString(),
    };
  }

  static toDtoList(leases: ILease[]): LeaseResponseDto[] {
    return leases.map((l) => LeaseMapper.toDto(l));
  }
}

export class TenantSearchMapper {
  static toDto(tenant: ITenant): TenantSearchResultDto {
    return {
      _id: String(tenant._id),
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      email: tenant.email,
      phone: tenant.phone ?? "",
      ...(tenant.avatar && { avatar: tenant.avatar }),
    };
  }

  static toDtoList(tenants: ITenant[]): TenantSearchResultDto[] {
    return tenants.map((t) => TenantSearchMapper.toDto(t));
  }
}

export class LandlordPropertyMapper {
  static toDto(property: IProperty): LandlordPropertyDto {
    return {
      _id: String(property._id),
      title: property.title,
      city: property.city,
      state: property.state,
      images: property.images ?? [],
      price: property.price,
      status: property.status,
    };
  }

  static toDtoList(properties: IProperty[]): LandlordPropertyDto[] {
    return properties.map((p) => LandlordPropertyMapper.toDto(p));
  }
}
