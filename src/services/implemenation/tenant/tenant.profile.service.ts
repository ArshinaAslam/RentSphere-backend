import bcrypt from "bcryptjs";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { uploadToS3 } from "../../../config/s3";
import {
  changePasswordDto,
  editTenantProfileDto,
  UserProfileDto,
} from "../../../dto/tenant/tenant.profile.dto";
import { UserMapper } from "../../../mappers/user.mapper";
import { ITenant } from "../../../models/tenantModel";
import { ITenantRepository } from "../../../repositories/interface/tenant/ITenantRepository";
import logger from "../../../utils/logger";
import { ITenantProfileService } from "../../interface/tenant/ITenantProfileService";

@injectable()
export class tenantProfileService implements ITenantProfileService {
  constructor(
    @inject(DI_TYPES.TenantRepository)
    private readonly _userRepo: ITenantRepository,
  ) {}

  async editTenantProfile(
    dto: editTenantProfileDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<{ user: UserProfileDto }> {
    logger.info("Tenant profile edit processing", {
      userId,
      firstName: dto.firstName,
      phone: dto.phone,
    });

    const tenant = await this._userRepo.findById(userId);
    if (!tenant) {
      logger.warn("Profile edit failed - tenant not found", { userId });
      throw new AppError("Tenant not found", HttpStatus.NOT_FOUND);
    }

    let avatarUrl: string | undefined;
    if (file) {
      avatarUrl = await uploadToS3(file, "avatars", userId);
      logger.info("Avatar uploaded to S3", { userId });
    }

    const updateData: Partial<ITenant> = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      ...(avatarUrl && { avatar: avatarUrl }),
      updatedAt: new Date(),
    };

    const updatedTenant = await this._userRepo.update(userId, updateData);
    if (!updatedTenant) {
      logger.warn("Profile edit failed - update returned null", { userId });
      throw new AppError("Tenant not found", HttpStatus.NOT_FOUND);
    }

    logger.info("Tenant profile updated successfully", {
      userId: String(updatedTenant._id),
      email: updatedTenant.email,
    });

    return { user: UserMapper.toResponseDto(updatedTenant) };
  }

  async changeTenantPassword(
    dto: changePasswordDto,
    userId: string,
  ): Promise<{ user: UserProfileDto }> {
    logger.info("Password change processing", {
      userId,
      newPasswordLength: dto.newPassword.length,
    });

    const tenant = await this._userRepo.findById(userId);
    if (!tenant) {
      logger.warn("Password change failed - tenant not found", { userId });
      throw new AppError("Tenant not found", HttpStatus.NOT_FOUND);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      tenant.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      logger.warn("Password change failed - invalid current password", {
        userId,
      });
      throw new AppError(
        "Current password is incorrect",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new AppError("New passwords do not match", HttpStatus.BAD_REQUEST);
    }

    if (dto.newPassword.length < 8) {
      throw new AppError(
        "New password must be at least 8 characters",
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    const updatedTenant = await this._userRepo.update(userId, {
      passwordHash: hashedPassword,
      updatedAt: new Date(),
    });

    if (!updatedTenant) {
      logger.warn("Password change failed - update returned null", { userId });
      throw new AppError("Tenant not found", HttpStatus.NOT_FOUND);
    }

    logger.info("Password changed successfully", {
      userId: String(updatedTenant._id),
      email: updatedTenant.email,
    });

    return { user: UserMapper.toResponseDto(updatedTenant) };
  }
}
