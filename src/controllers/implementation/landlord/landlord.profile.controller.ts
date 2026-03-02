import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";
import {
  changePasswordDto,
  editLandlordProfileDto,
} from "../../../dto/landlord/landlord.profile.dto";
import { AuthRequest } from "../../../middleware/auth.middleware";
import { ILandlordProfileService } from "../../../services/interface/landlord/ILandlordProfileService";
import logger from "../../../utils/logger";
import { ILandlordProfileController } from "../../interface/landlord/ILandlordProfileController";

@injectable()
export class LandlordProfileController implements ILandlordProfileController {
  constructor(
    @inject(DI_TYPES.LandlordProfileService)
    private readonly _landlordProfileService: ILandlordProfileService,
  ) {}

  async editLandlordProfile(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated"));
    }

    logger.info("Landlord profile edit request", { userId });

    const dto = req.body as editLandlordProfileDto;
    const file = req.file;

    const result = await this._landlordProfileService.editLandlordProfile(
      dto,
      userId,
      file,
    );

    logger.info("Landlord profile updated SUCCESS", {
      userId: result.user.id,
      email: result.user.email,
    });

    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "Profile updated successfully", {
        user: result.user,
      }),
    );
  }

  async changeLandlordPassword(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    logger.info("Password change request");

    const dto = req.body as changePasswordDto;
    const userId = req.user?.userId;
    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated"));
    }

    const result = await this._landlordProfileService.changeLandlordPassword(
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
