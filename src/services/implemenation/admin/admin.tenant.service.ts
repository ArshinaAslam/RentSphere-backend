import { Types } from "mongoose";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import {
  GetUsersDto,
  TenantsListResultDto,
  ToggleUserStatusDto,
} from "../../../dto/admin/admin.user.dto";
import { AdminMapper } from "../../../mappers/admin.mapper";
import { ITenantRepository } from "../../../repositories/interface/ITenantRepository";
import logger from "../../../utils/logger";
import {
  IAdminTenantService,
  TenantStatusResult,
} from "../../interface/admin/IAdminTenantService";

export const generateUserId = (id: string) => {
  return `USR-${id.slice(-4).padStart(4, "0")}`;
};

export function extractMongoIdFromTenantId(tenantId: string): string {
  if (!tenantId.startsWith("USR-")) {
    throw new Error(MESSAGES.ADMIN.INVALID_TENANT_ID_FORMAT);
  }
  return tenantId.slice(4);
}

@injectable()
export default class AdminTenantService implements IAdminTenantService {
  constructor(
    @inject(DI_TYPES.TenantRepository)
    private tenantRepo: ITenantRepository,
  ) {}

  async getTenants(dto: GetUsersDto): Promise<TenantsListResultDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 5;
    const skip = (page - 1) * limit;

    const [tenants, total] = await Promise.all([
      this.tenantRepo.findPaginated(
        skip,
        limit,
        dto.search ?? "",
        dto.from,
        dto.to,
      ),
      this.tenantRepo.countBySearch(dto.search ?? "", dto.from, dto.to),
    ]);

    return {
      users: tenants.map((t) => AdminMapper.toTenantListItem(t)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleTenantStatus(
    id: string,
    dto: ToggleUserStatusDto,
  ): Promise<TenantStatusResult> {
    logger.info("Admin toggling user status", {
      userId: id,
      status: dto.status,
    });

    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(
        MESSAGES.ADMIN.INVALID_USER_ID,
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedUser = await this.tenantRepo.updateUserById(id, {
      isActive: dto.status === "active",
    });

    if (!updatedUser) {
      throw new AppError(
        MESSAGES.ADMIN.UPDATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info("Tenant status toggled", { id, status: dto.status });
    return {
      id: String(updatedUser._id),
      userId: generateUserId(String(updatedUser._id)),
      fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
      status: updatedUser.isActive ? "active" : "blocked",
    };
  }
}
