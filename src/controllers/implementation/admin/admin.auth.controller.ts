import { Request, Response } from "express";
import { DI_TYPES } from "../../../common/di/types";

import { injectable, inject } from "tsyringe";


import { HttpStatus } from "../../../common/enums/httpStatus.enum";

import { ApiResponses } from "../../../common/response/ApiResponse";
import { AppError } from "../../../common/errors/appError";
import { AuthRequest } from "../../../middleware/auth.middleware";
import logger from "../../../utils/logger";
import { IAdminAuthService } from "../../../services/interface/admin/IAdminAuthService";
import { AdminLoginDto } from "../../../dto/admin/admin.auth.dto";
import { IAdminAuthController } from "../../interface/admin/IAdminAuthController";

@injectable()
export class AdminAuthController implements IAdminAuthController {
  constructor(
    @inject(DI_TYPES.AdminAuthService)
    private readonly _adminAuthService: IAdminAuthService,
  ) {}


 

 

  async adminLogin(req: Request, res: Response): Promise<Response> {
    logger.info("Admin login request", {
      email: req.body.email,
      ip: req.ip,
    });

    const dto: AdminLoginDto = {
      email: req.body.email,
      password: req.body.password,
    };

    const result = await this._adminAuthService.adminLogin(dto);

    logger.info("Admin login SUCCESS", {
      userId: result.user.id,
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

    console.log("Admin login controller completed", result.user);
    return res.status(HttpStatus.OK).json({
      success: true,
      user: result.user,
      redirectTo: "/admin/dashboard",
    });
  }


   async refreshAdminToken(req: Request, res: Response): Promise<Response> {
    logger.info("Token refresh request");
    console.log("refresh cpmtroller1", req.cookies.refreshToken);
    const refreshToken = req.cookies.refreshToken;
    console.log("refreshToken", refreshToken);
    if (!refreshToken) {
      throw new AppError("Refresh token required", HttpStatus.UNAUTHORIZED);
    }

    const result = await this._adminAuthService.refreshAdminToken(refreshToken);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    console.log("refresh cpmtroller2");
    logger.info("Token refresh SUCCESS");
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Token refreshed", { success: true }));
  }

  async logout(req: Request, res: Response): Promise<Response> {
    logger.info("Logout request", {
      ip: req.ip,
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    logger.info("Logout SUCCESS");

    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Logged out successfully", {}));
  }



 
}
