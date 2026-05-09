import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import {
  changePasswordDto,
  editTenantProfileDto,
} from "../../dto/tenant/tenant.profile.dto";
import { AuthRequest } from "../../middleware/auth.middleware";
import { ITenantProfileService } from "../../services/interface/tenant/ITenantProfileService";
import logger from "../../utils/logger";

@injectable()
export class TenantProfileController {
  constructor(
    @inject(DI_TYPES.TenantProfileService)
    private readonly _tenantProfileService: ITenantProfileService,
  ) {}

  async editTenantProfile(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error("User not authenticated"));
    }

    const dto = req.body as editTenantProfileDto;
    const file = req.file;

    const result = await this._tenantProfileService.editTenantProfile(
      dto,
      userId,
      file,
    );

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponses.success(
          { user: result.user },
          MESSAGES.PROFILE.PROFILE_UPDATE_SUCCESS,
        ),
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
        .json(ApiResponses.error(MESSAGES.PROFILE.USER_NOT_AUTHENTICATED));
    }

    const result = await this._tenantProfileService.changeTenantPassword(
      dto,
      userId,
    );

    logger.info("Password changed SUCCESS", {
      userId: result.user.id,
      email: result.user.email,
    });

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponses.success(
          { user: result.user },
          MESSAGES.PROFILE.PASSWORD_CHANGE_SUCCESS,
        ),
      );
  }
}
