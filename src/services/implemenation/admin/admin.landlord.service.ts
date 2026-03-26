import { Types, FilterQuery } from "mongoose";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import {
  LandlordDetailsDto,
  LandlordListDto,
} from "../../../dto/admin/admin.landlord.dto";
import {
  GetUsersDto,
  ToggleUserStatusDto,
} from "../../../dto/admin/admin.user.dto";
import { AdminMapper } from "../../../mappers/admin.mapper";
import { ILandlord } from "../../../models/landlordModel";
import { ILandlordRepository } from "../../../repositories/interface/ILandlordRepository";
import logger from "../../../utils/logger";
import {
  IAdminLandlordService,
  LandlordStatusResult,
} from "../../interface/admin/IAdminLandlordService";

export const generateUserId = (id: string) => {
  return `USR-${id.slice(-4).padStart(4, "0")}`;
};

export function extractMongoIdFromTenantId(tenantId: string): string {
  if (!tenantId.startsWith("USR-")) {
    throw new Error("Invalid tenantId format");
  }
  return tenantId.slice(4);
}

@injectable()
export default class AdminLandlordService implements IAdminLandlordService {
  constructor(
    @inject(DI_TYPES.LandlordRepository)
    private landlordRepo: ILandlordRepository,
  ) {}

  async getLandlords(dto: GetUsersDto): Promise<LandlordListDto> {
    logger.info("Admin fetching landlords", {
      search: dto.search,
      page: dto.page ?? 1,
    });

    const query: FilterQuery<ILandlord> = { role: "LANDLORD" };
    if (dto.search) {
      query.$or = [
        { firstName: { $regex: dto.search, $options: "i" } },
        { lastName: { $regex: dto.search, $options: "i" } },
        { email: { $regex: dto.search, $options: "i" } },
      ];
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const [landlords, total] = await Promise.all([
      this.landlordRepo
        .findMany(query)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.landlordRepo.count(query),
    ]);

    // const formattedLandlords = landlords.map((landlord) => ({
    //   id: landlord._id.toString(),
    //   tenantId: generateUserId(landlord._id.toString()),
    //   fullName: `${landlord.firstName} ${landlord.lastName}`,
    //   email: landlord.email,
    //   phone: landlord.phone ?? "",
    //   avatar: landlord.avatar,
    //   status: landlord.isActive ? "active" : "blocked",
    //   kycStatus: landlord.kycStatus ?? "NOT_SUBMITTED",
    // }));

    const mappedLandlords = landlords.map((l) =>
      AdminMapper.toLandlordListItem(l),
    );

    logger.info(`Fetched ${landlords.length} landlords`, { total, page });
    return {
      users: mappedLandlords,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLandlordDetails(id: string): Promise<LandlordDetailsDto> {
    logger.info("Fetching single landlord by ID", { id });

    const landlord = await this.landlordRepo.findById(id);

    if (!landlord) {
      throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
    }

    // const landlordDetails: LandlordDetailsDto = {
    //   id: landlord._id.toString(),
    //   landlordId: generateUserId(landlord._id.toString()),
    //   fullName: `${landlord.firstName} ${landlord.lastName}`,
    //   email: landlord.email,
    //   phone: landlord.phone ?? "",
    //   avatar: landlord.avatar ?? "",
    //   status: landlord.isActive ? "active" : "blocked",
    //   kycStatus: landlord.kycStatus ?? "NOT_SUBMITTED",

    //   aadharNumber: landlord.kycDetails?.aadhaarNumber || "",
    //   panNumber: landlord.kycDetails?.panNumber || "",
    //   aadharFrontUrl: landlord.kycDocuments?.aadhaarFront || "",
    //   aadharBackUrl: landlord.kycDocuments?.aadhaarBack || "",
    //   panFrontUrl: landlord.kycDocuments?.panCard || "",
    //   liveSelfie: landlord.kycDocuments?.liveSelfie || "",
    //   kycRejectedReason: landlord.kycRejectedReason || "",
    // };
    const landlordDetails = AdminMapper.toLandlordDetail(landlord);
    logger.info("Single landlord fetched successfully", {
      id,
      fullName: landlordDetails.fullName,
    });
    return landlordDetails;
  }

  async approveLandlordKyc(landlordId: string): Promise<LandlordDetailsDto> {
    const landlord = await this.landlordRepo.updateLandlordById(landlordId, {
      kycStatus: "APPROVED",
      isActive: true,
      kycRejectedReason: "",
    });

    if (!landlord) {
      throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
    }

    logger.info("KYC approved and landlord activated", { landlordId });

    return this.getLandlordDetails(landlordId);
  }

  async rejectLandlordKyc(
    landlordId: string,
    reason: string,
  ): Promise<LandlordDetailsDto> {
    const landlord = await this.landlordRepo.updateLandlordById(landlordId, {
      kycStatus: "REJECTED",
      kycRejectedReason: reason || "Documents not clear",
    });

    if (!landlord) {
      throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
    }

    logger.info("KYC rejected", { landlordId });
    return this.getLandlordDetails(landlordId);
  }

  async toggleLandlordStatus(
    id: string,
    dto: ToggleUserStatusDto,
  ): Promise<LandlordStatusResult> {
    logger.info("Admin toggling user status", {
      userId: id,
      status: dto.status,
    });

    if (!Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid user ID", HttpStatus.BAD_REQUEST);
    }

    const updatedUser = await this.landlordRepo.updateLandlordById(id, {
      isActive: dto.status === "active",
    });

    if (!updatedUser) {
      throw new AppError(
        "Failed to update landlord",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info("Landlord status toggled", { id, status: dto.status });
    return {
      id: String(updatedUser._id),
      userId: generateUserId(String(updatedUser._id)),
      fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
      status: updatedUser.isActive ? "active" : "blocked",
    };
  }
}
