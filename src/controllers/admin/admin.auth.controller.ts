import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import { AdminLoginDto } from "../../dto/admin/admin.auth.dto";
import { IAdminAuthService } from "../../services/interface/admin/IAdminAuthService";
import logger from "../../utils/logger";

@injectable()
export class AdminAuthController {
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
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HttpStatus.OK).json(
      ApiResponses.success(
        {
          user: result.user,
          redirectTo: "/admin/dashboard",
          tokens: result.tokens,
        },
        "Admin login successful",
      ),
    );
  }
}
