import { Types, FilterQuery } from "mongoose";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import {
  GetUsersDto,
  TenantsListResultDto,
  ToggleUserStatusDto,
} from "../../../dto/admin/admin.user.dto";
import { AdminMapper } from "../../../mappers/admin.mapper";
import { ITenant } from "../../../models/tenantModel";
import { ITenantRepository } from "../../../repositories/interface/tenant/ITenantRepository";
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
    throw new Error("Invalid tenantId format");
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
    logger.info("Admin fetching tenants", {
      search: dto.search,
      page: dto.page ?? 1,
    });

    const query: FilterQuery<ITenant> = { role: "TENANT" };
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

    const [tenants, total] = await Promise.all([
      this.tenantRepo
        .findMany(query)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.tenantRepo.count(query),
    ]);

    // const formattedTenants = tenants.map((tenant) => ({
    //   id: tenant._id.toString(),
    //   tenantId: generateUserId(tenant._id.toString()),
    //   fullName: `${tenant.firstName} ${tenant.lastName}`,
    //   email: tenant.email,
    //   phone: tenant.phone ?? "",
    //   avatar: tenant.avatar,
    //   status: tenant.isActive ? "active" : "blocked",
    //   kycStatus: tenant.kycStatus ?? "NOT_SUBMITTED",
    // }));

    const mappedTenants = tenants.map((t) => AdminMapper.toTenantListItem(t));

    logger.info(`Fetched ${tenants.length} tenants`, { total, page });
    return {
      users: mappedTenants,
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
      throw new AppError("Invalid user ID", HttpStatus.BAD_REQUEST);
    }

    const updatedUser = await this.tenantRepo.updateUserById(id, {
      isActive: dto.status === "active",
    });

    if (!updatedUser) {
      throw new AppError(
        "Failed to update tenant",
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
