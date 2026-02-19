import { Request, Response } from "express";

import { injectable, inject } from "tsyringe";
import { DI_TYPES } from "../../../common/di/types";

import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { MESSAGES } from "../../../common/constants/statusMessages";
import { ApiResponses } from "../../../common/response/ApiResponse";
import { AppError } from "../../../common/errors/appError";

import logger from "../../../utils/logger";
import { forgotPasswordDto, getKycStatusDto, KycFiles, LoginDto, resendOtpDto, resetPasswordDto, SignupDto, SubmitLandlordKycDto, verifyOtpDto } from "../../../dto/auth/auth.dto";
import { IAuthController } from "../../interface/auth/IAuthController";
import { IAuthService } from "../../../services/interface/auth/IAuthService";





@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject(DI_TYPES.AuthService)
    private readonly _authService: IAuthService,
  ) {}



  async signup(req: Request, res: Response): Promise<Response> {
    logger.info("Signup START", { email: req.body.email });
    const dto: SignupDto = req.body

    const data = await this._authService.signup(dto);

    logger.info("signup SUCCESS", { email: data.email });
    return res.status(HttpStatus.CREATED).json(
      new ApiResponses(true, MESSAGES.AUTH.SIGNUP_SUCCESS, {
        email: data.email,
      
      }),
    );
  }

  async googleAuth(req: Request, res: Response): Promise<Response> {
    logger.info("Google OAuth request", {
      role: req.body.role,
      email: req.body.email || "unknown",
      ip: req.ip,
    });
    const { token, role } = req.body;

    const result = await this._authService.googleAuth({ token, role });

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
    logger.info("OTP verify START", {
      email: req.body.email,
     
    });
    const dto: verifyOtpDto = req.body

    const kycData = await this._authService.verifyOtp(dto);
    logger.info("OTP verified SUCCESS", { email: req.body.email });
    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, MESSAGES.AUTH.EMAIL_VERIFIED, {
        kycData: kycData,
        redirectTo: "/landlord/kyc",
      }),
    );
  }

  async resendOtp(req: Request, res: Response): Promise<Response> {
    logger.info("OTP resend request", { email: req.body.email, ip: req.ip });
    const dto: resendOtpDto = req.body

    await this._authService.resendOtp(dto);
    logger.info("OTP resend SUCCESS", { email: req.body.email });
    return res
      .status(HttpStatus.CREATED)
      .json({ success: true, message: "New OTP sent to your email" });
  }



  async login(req: Request, res: Response): Promise<Response> {
    logger.info(" login request", {
      email: req.body.email,
     
    });

 

    const dto: LoginDto = req.body

    const result = await this._authService.login(dto);

    logger.info("login SUCCESS", {
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

   

    return res.status(HttpStatus.OK).json({
      success: true,
      user: result.user,
      tokens: result.tokens,
    //   redirectTo: "/landlord/dashboard",
    });
  }



  async forgotPassword(req: Request, res: Response): Promise<Response> {
    logger.info(" forgot password START", {
      email: req.body.email,
     
    });

    const dto: forgotPasswordDto = req.body
    

    const result = await this._authService.forgotPassword(dto);
    logger.info("forgot password OTP sent", { email: result.email });
    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "Reset OTP sent to email", {
        email: result.email,
        // redirectTo: "/landlord/forgot-verify-otp",
      }),
    );
  }


    async resetPassword(req: Request, res: Response): Promise<Response> {
      logger.info("Tenant password reset START", {
        email: req.body.email,
        ip: req.ip,
      });
      console.log("resetcontr1", req.body.email);
      const dto: resetPasswordDto = req.body
      
  
      const result = await this._authService.resetPassword(dto);
      logger.info("Tenant password reset SUCCESS", { email: req.body.email });
      console.log("resetcontro2", result);
      return res
        .status(HttpStatus.OK)
        .json(
          new ApiResponses(true, MESSAGES.AUTH.PASSWORD_RESET_SUCCESS, {
            redirectTo: "/tenant/login",
          }),
        );
    }
  



  async refreshToken(req: Request, res: Response): Promise<Response> {
    logger.info("Token refresh request");
    console.log("refresh cpmtroller1", req.cookies.refreshToken);
    const refreshToken = req.cookies.refreshToken;
    console.log("refreshToken", refreshToken);
    if (!refreshToken) {
      throw new AppError("Refresh token required", HttpStatus.UNAUTHORIZED);
    }

    const result = await this._authService.refreshToken(refreshToken);

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
