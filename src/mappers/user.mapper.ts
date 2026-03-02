import type { ILandlord } from "../models/landlordModel";
import type { ITenant } from "../models/tenantModel";
import type { UserResponse } from "../types/auth.types";

export class UserMapper {
  static toResponseDto(user: ITenant | ILandlord): UserResponse {
    const base: UserResponse = {
      id: String(user._id),
      email: user.email,
      role: user.role,
      fullName: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      avatar: user.avatar ?? "",
    };

    if (user.role === "LANDLORD") {
      const landlord = user as ILandlord;
      return {
        ...base,
        aadharNumber: landlord.kycDetails?.aadhaarNumber || "",
        panNumber: landlord.kycDetails?.panNumber || "",
        aadharFrontUrl: landlord.kycDocuments?.aadhaarFront || "",
        aadharBackUrl: landlord.kycDocuments?.aadhaarBack || "",
        panFrontUrl: landlord.kycDocuments?.panCard || "",
      };
    }

    return base;
  }
}
