import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";
import {
  changePasswordDto,
  editTenantProfileDto,
} from "../../../dto/tenant/tenant.profile.dto";
import { AuthRequest } from "../../../middleware/auth.middleware";
import { ITenantProfileService } from "../../../services/interface/tenant/ITenantProfileService";
import logger from "../../../utils/logger";
import { ITenantProfileController } from "../../interface/tenant/ITenantProfileController";
@injectable()
export class TenantProfileController implements ITenantProfileController {
  constructor(
    @inject(DI_TYPES.TenantProfileService)
    private readonly _tenantProfileService: ITenantProfileService,
  ) {}

  async editTenantProfile(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated"));
    }

    const dto = req.body as editTenantProfileDto;
    const file = req.file;

    const result = await this._tenantProfileService.editTenantProfile(
      dto,
      userId,
      file,
    );

    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "Profile updated successfully", {
        user: result.user,
      }),
    );
  }

  async changeTenantPassword(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    logger.info("Password change request", {
      userId: req.user?.userId,
      ip: req.ip,
    });

    const dto = req.body as changePasswordDto;

    const userId = req.user?.userId;
    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated"));
    }

    const result = await this._tenantProfileService.changeTenantPassword(
      dto,
      userId,
    );

    logger.info("Password changed SUCCESS", {
      userId: result.user.id,
      email: result.user.email,
    });

    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "Password changed successfully", {
        user: result.user,
      }),
    );
  }
}
