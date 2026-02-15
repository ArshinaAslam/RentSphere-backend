import { Request, Response } from "express";

import { injectable, inject } from "tsyringe";
import { DI_TYPES } from "../../../common/di/types";

import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { MESSAGES } from "../../../common/constants/statusMessages";
import { ApiResponses } from "../../../common/response/ApiResponse";
import { AppError } from "../../../common/errors/appError";

import logger from "../../../utils/logger";
import { AuthRequest } from "../../../middleware/auth.middleware";
import { ILandlordAuthService } from "../../../services/interface/landlord/ILandlordAuthService";
import { uploadToS3 } from "../../../config/s3";

import { changePasswordDto, editLandlordProfileDto } from "../../../dto/landlord/landlord.profile.dto";
import { ILandlordProfileService } from "../../../services/interface/landlord/ILandlordProfileService";
import { ILandlordProfileController } from "../../interface/landlord/ILandlordProfileController";

@injectable()
export class LandlordProfileController implements ILandlordProfileController {
  constructor(
    @inject(DI_TYPES.LandlordProfileService)
    private readonly _landlordProfileService: ILandlordProfileService,
  ) {}


 
  async editLandlordProfile(req: AuthRequest,res: Response): Promise<Response> {
   
    logger.info("Landlord profile edit request", {
      userId: req.user!.userId,
      ip: req.ip,
    });

    const userId = req.user?.userId;
   

    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated"));
    }

    console.log("req file is", req.file);
    let avatarUrl = null;
    if (req.file) {
      avatarUrl = await uploadToS3(req.file, "avatars", userId);
    }
    console.log("avatarUrl generated:", avatarUrl);

    const dto: editLandlordProfileDto = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      ...(avatarUrl && { avatar: avatarUrl }),
    };

    const result = await this._landlordProfileService.editLandlordProfile(dto, userId);

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


  async changeLandlordPassword(req: AuthRequest,res: Response,): Promise<Response> {
    
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

    const result = await this._landlordProfileService.changeLandlordPassword(dto, userId);

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
