import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { ApiResponses } from "../../../common/response/ApiResponse";
import { ENV } from "../../../config/env";
import {
  forgotPasswordDto,
  LoginDto,
  resendOtpDto,
  resetPasswordDto,
  SignupDto,
  verifyOtpDto,
} from "../../../dto/auth/auth.dto";
import { IAuthService } from "../../../services/interface/auth/IAuthService";
import { UserRole } from "../../../types/auth.types";
import logger from "../../../utils/logger";
import { IAuthController } from "../../interface/auth/IAuthController";

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject(DI_TYPES.AuthService)
    private readonly _authService: IAuthService,
  ) {}

  async signup(req: Request, res: Response): Promise<Response> {
    const dto = req.body as SignupDto;

    logger.info("Signup START", { email: dto.email });

    const data = await this._authService.signup(dto);

    logger.info("signup SUCCESS", { email: data.email });
    return res.status(HttpStatus.CREATED).json(
      new ApiResponses(true, MESSAGES.AUTH.SIGNUP_SUCCESS, {
        email: data.email,
      }),
    );
  }

  async googleAuth(req: Request, res: Response): Promise<Response> {
    const { token, role } = req.body as { token: string; role: UserRole };

    logger.info("Google OAuth request", {
      role: role,
    });

    const result = await this._authService.googleAuth({ token, role });

    res.cookie("accessToken", result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ENV.ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ENV.REFRESH_TOKEN_MAX_AGE,
    });

    logger.info("Google auth SUCCESS - cookies set", {
      userId: result.user.id,
      role,
      email: result.user.email,
    });

    return res.status(HttpStatus.OK).json({
      success: true,
      user: result.user,
      redirectTo:
        role === "TENANT" ? "/tenant/dashboard" : "/landlord/kyc-submit",
    });
  }

  async verifyOtp(req: Request, res: Response): Promise<Response> {
    const dto = req.body as verifyOtpDto;
    logger.info("OTP verify START", {
      email: dto.email,
    });

    const kycData = await this._authService.verifyOtp(dto);
    logger.info("OTP verified SUCCESS", { email: dto.email });
    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, MESSAGES.AUTH.EMAIL_VERIFIED, {
        kycData: kycData,
        redirectTo: "/landlord/kyc",
      }),
    );
  }

  async resendOtp(req: Request, res: Response): Promise<Response> {
    const dto = req.body as resendOtpDto;
    logger.info("OTP resend request", { email: dto.email });

    await this._authService.resendOtp(dto);
    logger.info("OTP resend SUCCESS", { email: dto.email });
    return res
      .status(HttpStatus.CREATED)
      .json({ success: true, message: "New OTP sent to your email" });
  }

  async login(req: Request, res: Response): Promise<Response> {
    const dto = req.body as LoginDto;
    logger.info(" login request", {
      email: dto.email,
    });

    const result = await this._authService.login(dto);

    logger.info("login SUCCESS", {
      userId: result.user.id,
      email: result.user.email,
    });

    res.cookie("accessToken", result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ENV.ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ENV.REFRESH_TOKEN_MAX_AGE,
    });

    return res.status(HttpStatus.OK).json({
      success: true,
      user: result.user,
      tokens: result.tokens,
    });
  }

  async forgotPassword(req: Request, res: Response): Promise<Response> {
    const dto = req.body as forgotPasswordDto;

    logger.info(" forgot password START", {
      email: dto.email,
    });

    const result = await this._authService.forgotPassword(dto);
    logger.info("forgot password OTP sent", { email: result.email });
    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "Reset OTP sent to email", {
        email: result.email,
      }),
    );
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    const dto = req.body as resetPasswordDto;
    logger.info("Tenant password reset START", {
      email: dto.email,
    });

    await this._authService.resetPassword(dto);
    logger.info("Tenant password reset SUCCESS", { email: dto.email });

    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, MESSAGES.AUTH.PASSWORD_RESET_SUCCESS, {
        redirectTo: "/tenant/login",
      }),
    );
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    logger.info("Token refresh request");

    const { refreshToken } = req.cookies as { refreshToken: string };
    if (!refreshToken) {
      throw new AppError("Refresh token required", HttpStatus.UNAUTHORIZED);
    }

    const result = await this._authService.refreshToken(refreshToken);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ENV.ACCESS_TOKEN_MAX_AGE,
    });

    logger.info("Token refresh SUCCESS");
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Token refreshed", { success: true }));
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(req: Request, res: Response): Promise<Response> {
    logger.info("Logout request", {});
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
