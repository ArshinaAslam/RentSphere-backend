// import { Request, Response } from "express";
// import { DI_TYPES } from "../../../../common/di/types";
// import { IAuthService } from "../../services/interface/IAuthService";
// import { IAuthController } from "../interface/IAuthController";
// import { injectable, inject } from "tsyringe";
// import { uploadToS3 } from "../../../../config/s3";
// import {
//   changePasswordDto,
//   editLandlordProfileDto,
//   editTenantProfileDto,
//   forgotPasswordDto,
//   getKycStatusDto,
//   KycFiles,
//   resendOtpDto,
//   resetPasswordDto,
//   SubmitKycDto,
//   SubmitLandlordKycDto,
//   UserLoginDto,
//   UserSignupDto,
//   verifyOtpDto,
// } from "../../dto/tenantSignup.dto";
// import { HttpStatus } from "../../../../common/enums/httpStatus.enum";
// import { MESSAGES } from "../../../../common/constants/statusMessages";
// import { ApiResponses } from "../../../../common/response/ApiResponse";
// import { AppError } from "../../../../common/errors/appError";
// import { AuthRequest } from "../../../../middleware/auth.middleware";
// import logger from "../../../../utils/logger";

// @injectable()
// export class TenantAuthController implements ITenantAuthController {
//   constructor(
//     @inject(DI_TYPES.TenantService)
//     private readonly _authService: ITenantAuthService,
//   ) {}

//   async tenantSignup(req: Request, res: Response): Promise<Response> {
//     logger.info("Tenant signup request", {
//       email: req.body.email,
//       ip: req.ip,
//     });

//     const dto: UserSignupDto = {
//       firstName: req.body.firstName,
//       lastName: req.body.lastName,
//       email: req.body.email,
//       phone: req.body.phone,
//       password: req.body.password,
//       role: req.body.role,
//     };
//     const data = await this._authService.tenantSignup(dto);

//     logger.info("Tenant signup SUCCESS", {
//       email: data.email,
//     });

//     return res.status(HttpStatus.CREATED).json(
//       new ApiResponses(true, MESSAGES.AUTH.SIGNUP_SUCCESS, {
//         email: data.email,
//         redirectTo: "/tenant/verify-otp",
//       }),
//     );
//   }

 
//   async googleAuth(req: Request, res: Response): Promise<Response> {
//     logger.info("Google OAuth request", {
//       role: req.body.role,
//       email: req.body.email || "unknown",
//       ip: req.ip,
//     });
//     const { token, role } = req.body;

//     const result = await this._authService.googleAuth({ token, role });

//     res.cookie("accessToken", result.tokens.accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 15 * 60 * 1000,
//     });

//     res.cookie("refreshToken", result.tokens.refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     logger.info("Google auth SUCCESS - cookies set", {
//       userId: result.user.id,
//       role,
//       email: result.user.email,
//     });

//     return res.status(HttpStatus.OK).json({
//       success: true,
//       user: result.user,
//       redirectTo:
//         role === "TENANT" ? "/tenant/dashboard" : "/landlord/dashboard",
//     });
//   }

//   async verifyTenantOtp(req: Request, res: Response): Promise<Response> {
//     logger.info("Tenant OTP verify START", { email: req.body.email });

//     const dto: verifyOtpDto = {
//       email: req.body.email,
//       otp: req.body.otp,
//     };

//     await this._authService.verifyTenantOtp(dto);
//     logger.info("Tenant OTP verified SUCCESS", { email: req.body.email });
//     return res.status(HttpStatus.CREATED).json({
//       success: true,
//       message: MESSAGES.AUTH.EMAIL_VERIFIED,
//       // redirectTo: "/tenant/login",
//     });
//   }



//   async resendOtp(req: Request, res: Response): Promise<Response> {
//     logger.info("OTP resend request", { email: req.body.email, ip: req.ip });
//     const dto: resendOtpDto = {
//       email: req.body.email,
//     };

//     await this._authService.resendOtp(dto);
//     logger.info("OTP resend SUCCESS", { email: req.body.email });
//     return res
//       .status(HttpStatus.CREATED)
//       .json({ success: true, message: "New OTP sent to your email" });
//   }

//   async tenantLogin(req: Request, res: Response): Promise<Response> {
//     logger.info("Tenant login request", {
//       email: req.body.email,
//       ip: req.ip,
//     });
//     console.log("reached tenantlogin1");
//     const dto: UserLoginDto = {
//       email: req.body.email,
//       password: req.body.password,
//     };

//     const result = await this._authService.tenantLogin(dto);

//     logger.info("Tenant login SUCCESS", {
//       userId: result.user.id,
//       email: result.user.email,
//     });

//     res.cookie("accessToken", result.tokens.accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 15 * 60 * 1000,
//     });

//     res.cookie("refreshToken", result.tokens.refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     console.log("login<<<>>>>>>", result.user);
//     return res.status(HttpStatus.OK).json({
//       success: true,
//       user: result.user,
//       tokens: result.tokens,
//       redirectTo: "/tenant/dashboard",
//     });
//   }



//   async tenantForgotPassword(req: Request, res: Response): Promise<Response> {
//     logger.info("Forgot password START", { email: req.body.email, ip: req.ip });

//     console.log("req.body", req.body);
//     const dto: forgotPasswordDto = {
//       email: req.body.email,
//     };

//     const result = await this._authService.tenantForgotPassword(dto);
//     logger.info("Forgot password OTP sent", { email: result.email });
//     return res
//       .status(HttpStatus.OK)
//       .json(
//         new ApiResponses(true, "Reset OTP sent to email", {
//           email: result.email,
//           redirectTo: "/tenant/forgot-verify-otp",
//         }),
//       );
//   }

//   async tenantResetPassword(req: Request, res: Response): Promise<Response> {
//     logger.info("Tenant password reset START", {
//       email: req.body.email,
//       ip: req.ip,
//     });
//     console.log("resetcontr1", req.body.email);
//     const dto: resetPasswordDto = {
//       newPassword: req.body.password,
//       email: req.body.email,
//     };

//     const result = await this._authService.resetPassword(dto);
//     logger.info("Tenant password reset SUCCESS", { email: req.body.email });
//     console.log("resetcontro2", result);
//     return res
//       .status(HttpStatus.OK)
//       .json(
//         new ApiResponses(true, MESSAGES.AUTH.PASSWORD_RESET_SUCCESS, {
//           redirectTo: "/tenant/login",
//         }),
//       );
//   }

  

//   async refreshToken(req: Request, res: Response): Promise<Response> {
//     logger.info("Token refresh request");
//     console.log("refresh cpmtroller1", req.cookies.refreshToken);
//     const refreshToken = req.cookies.refreshToken;
//     console.log("refreshToken", refreshToken);
//     if (!refreshToken) {
//       throw new AppError("Refresh token required", HttpStatus.UNAUTHORIZED);
//     }

//     const result = await this._authService.refreshToken(refreshToken);

//     res.cookie("accessToken", result.accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 15 * 60 * 1000,
//     });
//     console.log("refresh cpmtroller2");
//     logger.info("Token refresh SUCCESS");
//     return res
//       .status(HttpStatus.OK)
//       .json(new ApiResponses(true, "Token refreshed", { success: true }));
//   }

//   async logout(req: Request, res: Response): Promise<Response> {
//     logger.info("Logout request", {
//       ip: req.ip,
//     });
//     res.clearCookie("accessToken", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       path: "/",
//       maxAge: 0,
//     });

//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       path: "/",
//       maxAge: 0,
//     });

//     logger.info("Logout SUCCESS");

//     return res
//       .status(HttpStatus.OK)
//       .json(new ApiResponses(true, "Logged out successfully", {}));
//   }

     

//   async changeTenantPassword(
//     req: AuthRequest,
//     res: Response,
//   ): Promise<Response> {
//     logger.info("Password change request", {
//       userId: req.user!.userId,
//       ip: req.ip,
//     });

//     const dto: changePasswordDto = {
//       currentPassword: req.body.currentPassword,
//       newPassword: req.body.newPassword,
//       confirmPassword: req.body.confirmPassword,
//     };

//     const userId = req.user?.userId;
//     if (!userId) {
//       return res
//         .status(HttpStatus.UNAUTHORIZED)
//         .json(new ApiResponses(false, "User not authenticated"));
//     }

//     const result = await this._authService.changeTenantPassword(dto, userId);

//     logger.info("Password changed SUCCESS", {
//       userId: result.user.id,
//       email: result.user.email,
//     });
//     console.log("1234");
//     return res.status(HttpStatus.OK).json(
//       new ApiResponses(true, "Password changed successfully", {
//         user: result.user,
//       }),
//     );
//   }

 


// }
