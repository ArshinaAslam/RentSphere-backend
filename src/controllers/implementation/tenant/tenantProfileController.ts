import { Request, Response } from "express";
import { DI_TYPES } from "../../../common/di/types";

import { ITenantAuthController } from "../../interface/tenant/ITenantAuthController";
import { injectable, inject } from "tsyringe";


import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { MESSAGES } from "../../../common/constants/statusMessages";
import { ApiResponses } from "../../../common/response/ApiResponse";
import { AppError } from "../../../common/errors/appError";

import logger from "../../../utils/logger";
import { AuthRequest } from "../../../middleware/auth.middleware";
import { changePasswordDto, editTenantProfileDto } from "../../../dto/tenant/tenant.profile.dto";
import { ITenantProfileController } from "../../interface/tenant/ITenantProfileController";
import { ITenantProfileService } from "../../../services/interface/tenant/ITenantProfileService";
import { uploadToS3 } from "../../../config/s3";
@injectable()
export class TenantProfileController implements ITenantProfileController {
  constructor(
    @inject(DI_TYPES.TenantProfileService)
    private readonly _tenantProfileService: ITenantProfileService,
  ) {}




  async editTenantProfile(req: AuthRequest, res: Response): Promise<Response> {
    logger.info("Tenant profile edit request", {
      userId: req.user!.userId,
      ip: req.ip,
    });

    const userId = req.user?.userId;
    console.log("reached controler", userId);
    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated"));
    }

    console.log("req fil is", req.file);
    let avatarUrl = null;
    if (req.file) {
      avatarUrl = await uploadToS3(req.file, "avatars", userId);
    }
    

    const dto: editTenantProfileDto = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      ...(avatarUrl && { avatar: avatarUrl }),
    };

    const result = await this._tenantProfileService.editTenantProfile(dto, userId);

    logger.info("Tenant profile updated SUCCESS", {
      userId: result.user.id,
      email: result.user.email,
    });

    console.log("gonr from controller", result.user);

    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "Profile updated successfully", {
        user: result.user,
      }),
    );
  }



  async changeTenantPassword(req: AuthRequest,res: Response): Promise<Response> {
    logger.info("Password change request", {
      userId: req.user!.userId,
      ip: req.ip,
    });

    const dto: changePasswordDto = {
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword,
    };

    const userId = req.user?.userId;
    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated"));
    }

    const result = await this._tenantProfileService.changeTenantPassword(dto, userId);

    logger.info("Password changed SUCCESS", {
      userId: result.user.id,
      email: result.user.email,
    });
    console.log("1234");
    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "Password changed successfully", {
        user: result.user,
      }),
    );
  }

 



}
