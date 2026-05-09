import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { ENV } from "../../../config/env";
import {
  AdminLoginDto,
  AdminResponseDto,
} from "../../../dto/admin/admin.auth.dto";
import { AdminMapper } from "../../../mappers/admin.mapper";
import { IAdminRepository } from "../../../repositories/interface/IAdminReposiory";
import logger from "../../../utils/logger";
import { IAdminAuthService } from "../../interface/admin/IAdminAuthService";

@injectable()
export class AdminAuthService implements IAdminAuthService {
  constructor(
    @inject(DI_TYPES.AdminRepository)
    private readonly _adminRepo: IAdminRepository,
  ) {}

  async adminLogin(dto: AdminLoginDto): Promise<AdminResponseDto> {
    logger.info("Admin login validation", { email: dto.email });

    const admin = await this._adminRepo.findByEmail(dto.email);

    if (!admin) {
      logger.warn("Admin login failed - admin not found", { email: dto.email });
      throw new AppError(MESSAGES.ADMIN.INVALID_EMAIL, HttpStatus.UNAUTHORIZED);
    }

    if (!admin.isActive) {
      logger.warn("Admin login failed - inactive admin", { email: dto.email });
      throw new AppError(
        MESSAGES.ADMIN.ACCOUNT_INACTIVE,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isValidPassword = await bcrypt.compare(
      dto.password,
      admin.passwordHash,
    );
    if (!isValidPassword) {
      logger.warn("Admin login failed - wrong password", { email: dto.email });
      throw new AppError(
        MESSAGES.ADMIN.WRONG_PASSWORD,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = {
      userId: String(admin._id),
      email: admin.email,
      role: "ADMIN",
    };
    const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    logger.info("Admin login success", {
      userId: String(admin._id),
      email: admin.email,
    });

    return {
      user: AdminMapper.toAdminResponseDto(admin),
      tokens: { accessToken, refreshToken },
    };
  }
}
