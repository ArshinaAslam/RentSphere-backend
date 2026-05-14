import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { AppError } from "../../common/errors/appError";
import { ApiResponses } from "../../common/response/ApiResponse";
import { ENV } from "../../config/env";
import {
  forgotPasswordDto,
  LoginDto,
  resendOtpDto,
  resetPasswordDto,
  SignupDto,
  verifyOtpDto,
} from "../../dto/auth/auth.dto";
import { IAuthService } from "../../services/interface/auth/IAuthService";
import { UserRole } from "../../types/auth.types";

@injectable()
export class AuthController {
  constructor(
    @inject(DI_TYPES.AuthService)
    private readonly _authService: IAuthService,
  ) {}

  async signup(req: Request, res: Response): Promise<Response> {
    const dto = req.body as SignupDto;

    const data = await this._authService.signup(dto);

    return res
      .status(HttpStatus.CREATED)
      .json(
        ApiResponses.success(
          { email: data.email },
          MESSAGES.AUTH.SIGNUP_SUCCESS,
        ),
      );
  }

  async googleAuth(req: Request, res: Response): Promise<Response> {
    const { token, role } = req.body as { token: string; role: UserRole };

    const result = await this._authService.googleAuth({ token, role });

    res.cookie("accessToken", result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: ENV.ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: ENV.REFRESH_TOKEN_MAX_AGE,
    });

    return res.status(HttpStatus.OK).json(
      ApiResponses.success(
        {
          user: result.user,
          redirectTo:
            role === "TENANT" ? "/tenant/dashboard" : "/landlord/kyc-details",
        },
        "Google authentication successful",
      ),
    );
  }

  async verifyOtp(req: Request, res: Response): Promise<Response> {
    const dto = req.body as verifyOtpDto;

    const kycData = await this._authService.verifyOtp(dto);

    return res.status(HttpStatus.OK).json(
      ApiResponses.success(
        {
          kycData,
          // redirectTo: "/landlord/kyc",
        },
        MESSAGES.AUTH.EMAIL_VERIFIED,
      ),
    );
  }

  async resendOtp(req: Request, res: Response): Promise<Response> {
    const dto = req.body as resendOtpDto;

    await this._authService.resendOtp(dto);

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponses.success(null, MESSAGES.AUTH.RESEND_OTP_SENT));
  }

  async login(req: Request, res: Response): Promise<Response> {
    const dto = req.body as LoginDto;

    const result = await this._authService.login(dto);

    res.cookie("accessToken", result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: ENV.ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: ENV.REFRESH_TOKEN_MAX_AGE,
    });

    return res.status(HttpStatus.OK).json(
      ApiResponses.success(
        {
          user: result.user,
          tokens: result.tokens,
        },
        MESSAGES.AUTH.LOGIN_SUCCES,
      ),
    );
  }

  async forgotPassword(req: Request, res: Response): Promise<Response> {
    const dto = req.body as forgotPasswordDto;

    const result = await this._authService.forgotPassword(dto);

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponses.success(
          { email: result.email },
          MESSAGES.AUTH.RESET_OTP_SENT,
        ),
      );
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    const dto = req.body as resetPasswordDto;

    await this._authService.resetPassword(dto);

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponses.success(
          { redirectTo: "/tenant/login" },
          MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
        ),
      );
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
    const { refreshToken } = req.cookies as { refreshToken: string };

    if (!refreshToken) {
      throw new AppError(
        MESSAGES.AUTH.REFRESH_TOKEN_REQUIRED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await this._authService.refreshToken(refreshToken);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: ENV.ACCESS_TOKEN_MAX_AGE,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(null, MESSAGES.AUTH.TOKEN_REFRESHED));
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(req: Request, res: Response): Promise<Response> {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 0,
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 0,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(null, MESSAGES.AUTH.LOGOUT_SUCCESS));
  }
}
