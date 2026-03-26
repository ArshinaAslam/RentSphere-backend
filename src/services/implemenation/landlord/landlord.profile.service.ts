import bcrypt from "bcryptjs";
import { inject, injectable } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { uploadToS3 } from "../../../config/s3";
import {
  changePasswordDto,
  editLandlordProfileDto,
} from "../../../dto/landlord/landlord.profile.dto";
import { UserMapper } from "../../../mappers/user.mapper";
import { ILandlord } from "../../../models/landlordModel";
import { ILandlordRepository } from "../../../repositories/interface/ILandlordRepository";
import logger from "../../../utils/logger";
import { IEmailService } from "../../interface/IEmailService";
import { IRedisService } from "../../interface/IRedisService";
import {
  ILandlordProfileService,
  LandlordProfile,
} from "../../interface/landlord/ILandlordProfileService";

@injectable()
export class LandlordProfileService implements ILandlordProfileService {
  constructor(
    @inject(DI_TYPES.RedisService)
    private readonly _redisService: IRedisService,
    @inject(DI_TYPES.EmailService)
    private readonly _emailService: IEmailService,
    @inject(DI_TYPES.LandlordRepository)
    private readonly _landlordRepo: ILandlordRepository,
  ) {}

  async editLandlordProfile(
    dto: editLandlordProfileDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<{ user: LandlordProfile }> {
    logger.info("Landlord profile edit processing", {
      userId,
      firstName: dto.firstName,
      phone: dto.phone,
    });

    const landlord = await this._landlordRepo.findById(userId);
    if (!landlord) {
      logger.warn("Profile edit failed - landlord not found", { userId });
      throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
    }

    let avatarUrl: string | undefined;
    if (file) {
      avatarUrl = await uploadToS3(file, "avatars", userId);
      logger.info("Avatar uploaded to S3", { userId });
    }

    const updateData: Partial<ILandlord> = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      ...(avatarUrl && { avatar: avatarUrl }),
      updatedAt: new Date(),
    };

    const updatedLandlord = await this._landlordRepo.update(userId, updateData);
    if (!updatedLandlord) {
      logger.warn("Profile edit failed - update returned null", { userId });
      throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
    }

    logger.info("Landlord profile updated successfully", {
      userId: String(updatedLandlord._id),
      email: updatedLandlord.email,
    });

    return { user: UserMapper.toResponseDto(updatedLandlord) };
  }

  async changeLandlordPassword(
    dto: changePasswordDto,
    userId: string,
  ): Promise<{ user: LandlordProfile }> {
    logger.info("Password change processing", {
      userId,
      newPasswordLength: dto.newPassword.length,
    });

    const landlord = await this._landlordRepo.findById(userId);
    if (!landlord) {
      logger.warn("Password change failed - landlord not found", { userId });
      throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      landlord.passwordHash,
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

    const updatedLandlord = await this._landlordRepo.update(userId, {
      passwordHash: hashedPassword,
      updatedAt: new Date(),
    });

    if (!updatedLandlord) {
      logger.warn("Password change failed - update returned null", { userId });
      throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
    }

    logger.info("Password changed successfully", {
      userId: String(updatedLandlord._id),
      email: updatedLandlord.email,
    });

    return { user: UserMapper.toResponseDto(updatedLandlord) };
  }
}
