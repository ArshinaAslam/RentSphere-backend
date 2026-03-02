import type {
  LandlordDetailsDto,
  LandlordListItemDto,
} from "../dto/admin/admin.landlord.dto";
import type { TenantListItemDto } from "../dto/admin/admin.user.dto";
import type { IAdmin } from "../models/adminModel";
import type { ILandlord } from "../models/landlordModel";
import type { ITenant } from "../models/tenantModel";
import type { AdminResponse } from "../types/admin.types";

export class AdminMapper {
  static toAdminResponseDto(admin: IAdmin): AdminResponse {
    return {
      _id: String(admin._id),
      email: admin.email,
      role: "ADMIN",
    };
  }

  static toLandlordListItem(landlord: ILandlord): LandlordListItemDto {
    return {
      id: String(landlord._id),
      fullName: `${landlord.firstName} ${landlord.lastName}`,
      email: landlord.email,
      phone: landlord.phone ?? "",
      avatar: landlord.avatar,
      status: landlord.isActive ? "active" : "blocked",
      kycStatus: landlord.kycStatus ?? "NOT_SUBMITTED",
    };
  }

  static toLandlordDetail(landlord: ILandlord): LandlordDetailsDto {
    return {
      id: String(landlord._id),
      fullName: `${landlord.firstName} ${landlord.lastName}`,
      email: landlord.email,
      phone: landlord.phone ?? "",
      avatar: landlord.avatar ?? "",
      status: landlord.isActive ? "active" : "blocked",
      kycStatus: landlord.kycStatus ?? "NOT_SUBMITTED",
      aadharNumber: landlord.kycDetails?.aadhaarNumber || "",
      panNumber: landlord.kycDetails?.panNumber || "",
      aadharFrontUrl: landlord.kycDocuments?.aadhaarFront || "",
      aadharBackUrl: landlord.kycDocuments?.aadhaarBack || "",
      panFrontUrl: landlord.kycDocuments?.panCard || "",
      liveSelfie: landlord.kycDocuments?.liveSelfie || "",
      kycRejectedReason: landlord.kycRejectedReason || "",
    };
  }

  static toTenantListItem(tenant: ITenant): TenantListItemDto {
    return {
      id: String(tenant._id),
      fullName: `${tenant.firstName} ${tenant.lastName}`,
      email: tenant.email,
      phone: tenant.phone ?? "",
      avatar: tenant.avatar,
      status: tenant.isActive ? "active" : "blocked",
      kycStatus: tenant.kycStatus ?? "NOT_SUBMITTED",
    };
  }
}
