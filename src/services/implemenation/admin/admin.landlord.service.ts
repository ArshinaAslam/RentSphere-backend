import { Types } from "mongoose";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
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
import { ILandlordRepository } from "../../../repositories/interface/ILandlordRepository";
import logger from "../../../utils/logger";
import {
  IAdminLandlordService,
  LandlordStatusResult,
} from "../../interface/admin/IAdminLandlordService";

export const generateUserId = (landlordId: string) => {
  return `USR-${landlordId.slice(-4).padStart(4, "0")}`;
};

export function extractMongoIdFromTenantId(tenantId: string): string {
  if (!tenantId.startsWith("USR-")) {
    throw new Error(MESSAGES.ADMIN.INVALID_TENANT_ID_FORMAT);
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

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const [landlords, total] = await Promise.all([
      this.landlordRepo.findPaginated(
        skip,
        limit,
        dto.search,
        dto.from,
        dto.to,
      ),
      this.landlordRepo.countByFilter(dto.search, dto.from, dto.to),
    ]);

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

  async getLandlordDetails(landlordId: string): Promise<LandlordDetailsDto> {
    logger.info("Fetching single landlord by ID", { landlordId });

    const landlord = await this.landlordRepo.findById(landlordId);

    if (!landlord) {
      throw new AppError(
        MESSAGES.ADMIN.LANDLORD_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const landlordDetails = AdminMapper.toLandlordDetail(landlord);
    logger.info("Single landlord fetched successfully", {
      landlordId,
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
      throw new AppError(
        MESSAGES.ADMIN.LANDLORD_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
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
      throw new AppError(
        MESSAGES.ADMIN.LANDLORD_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    logger.info("KYC rejected", { landlordId });
    return this.getLandlordDetails(landlordId);
  }

  async toggleLandlordStatus(
    landlordId: string,
    dto: ToggleUserStatusDto,
  ): Promise<LandlordStatusResult> {
    logger.info("Admin toggling user status", {
      userId: landlordId,
      status: dto.status,
    });

    if (!Types.ObjectId.isValid(landlordId)) {
      throw new AppError(
        MESSAGES.ADMIN.INVALID_USER_ID,
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedUser = await this.landlordRepo.updateLandlordById(landlordId, {
      isActive: dto.status === "active",
    });

    if (!updatedUser) {
      throw new AppError(
        MESSAGES.ADMIN.UPDATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info("Landlord status toggled", { landlordId, status: dto.status });
    return {
      id: String(updatedUser._id),
      userId: generateUserId(String(updatedUser._id)),
      fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
      status: updatedUser.isActive ? "active" : "blocked",
    };
  }
}
