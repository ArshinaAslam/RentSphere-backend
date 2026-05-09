import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import {
  changePasswordDto,
  editLandlordProfileDto,
} from "../../dto/landlord/landlord.profile.dto";
import { AuthRequest } from "../../middleware/auth.middleware";
import { ILandlordProfileService } from "../../services/interface/landlord/ILandlordProfileService";

@injectable()
export class LandlordProfileController {
  constructor(
    @inject(DI_TYPES.LandlordProfileService)
    private readonly _landlordProfileService: ILandlordProfileService,
  ) {}

  async editLandlordProfile(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    const userId = req.user?.userId;

    if (!userId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PROFILE.USER_NOT_AUTHENTICATED));

    const dto = req.body as editLandlordProfileDto;
    const file = req.file;

    const result = await this._landlordProfileService.editLandlordProfile(
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

  async changeLandlordPassword(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    const userId = req.user?.userId;

    if (!userId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PROFILE.USER_NOT_AUTHENTICATED));

    const dto = req.body as changePasswordDto;

    const result = await this._landlordProfileService.changeLandlordPassword(
      dto,
      userId,
    );

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
