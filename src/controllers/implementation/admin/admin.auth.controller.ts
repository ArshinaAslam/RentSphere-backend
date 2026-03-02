import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AdminLoginDto } from "../../../dto/admin/admin.auth.dto";
import { IAdminAuthService } from "../../../services/interface/admin/IAdminAuthService";
import logger from "../../../utils/logger";
import { IAdminAuthController } from "../../interface/admin/IAdminAuthController";

@injectable()
export class AdminAuthController implements IAdminAuthController {
  constructor(
    @inject(DI_TYPES.AdminAuthService)
    private readonly _adminAuthService: IAdminAuthService,
  ) {}

  async adminLogin(req: Request, res: Response): Promise<Response> {
    const dto = req.body as AdminLoginDto;
    logger.info("Admin login request", {
      email: dto.email,
    });

    const result = await this._adminAuthService.adminLogin(dto);

    logger.info("Admin login SUCCESS", {
      userId: result.user._id,
      email: result.user.email,
    });

    res.cookie("accessToken", result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HttpStatus.OK).json({
      success: true,
      user: result.user,
      redirectTo: "/admin/dashboard",
    });
  }

  // async refreshAdminToken(req: Request, res: Response): Promise<Response> {
  //   logger.info("Token refresh request");

  //   const refreshToken = req.cookies.refreshToken;

  //   if (!refreshToken) {
  //     throw new AppError("Refresh token required", HttpStatus.UNAUTHORIZED);
  //   }

  //   const result = await this._adminAuthService.refreshAdminToken(refreshToken);

  //   res.cookie("accessToken", result.accessToken, {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: "strict",
  //     maxAge: 15 * 60 * 1000,
  //   });
  //   console.log("refresh cpmtroller2");
  //   logger.info("Token refresh SUCCESS");
  //   return res
  //     .status(HttpStatus.OK)
  //     .json(new ApiResponses(true, "Token refreshed", { success: true }));
  // }

  // async logout(req: Request, res: Response): Promise<Response> {
  //   logger.info("Logout request", {
  //     ip: req.ip,
  //   });
  //   res.clearCookie("accessToken", {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: "strict",
  //     path: "/",
  //     maxAge: 0,
  //   });

  //   res.clearCookie("refreshToken", {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: "strict",
  //     path: "/",
  //     maxAge: 0,
  //   });

  //   logger.info("Logout SUCCESS");

  //   return res
  //     .status(HttpStatus.OK)
  //     .json(new ApiResponses(true, "Logged out successfully", {}));
  // }
}
