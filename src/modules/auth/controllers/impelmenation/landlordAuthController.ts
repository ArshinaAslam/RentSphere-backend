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
// export class LandlordAuthController implements ILandlordAuthController {
//   constructor(
//     @inject(DI_TYPES.LandlordService)
//     private readonly _landlordAuthService: ILandlordAuthService,
//   ) {}



//   async landlordSignup(req: Request, res: Response): Promise<Response> {
//     logger.info("Landlord signup START", { email: req.body.email, ip: req.ip });
//     const dto: UserSignupDto = {
//       firstName: req.body.firstName,
//       lastName: req.body.lastName,
//       email: req.body.email,
//       phone: req.body.phone,
//       password: req.body.password,
//       role: req.body.role,
//     };

//     const data = await this._landlordAuthService.landlordSignup(dto);

//     logger.info("Landlord signup SUCCESS", { email: data.email });
//     return res.status(HttpStatus.CREATED).json(
//       new ApiResponses(true, MESSAGES.AUTH.SIGNUP_SUCCESS, {
//         email: data.email,
//         redirectTo: "/landlord/verify-otp",
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

//     const result = await this._landlordAuthService.googleAuth({ token, role });

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
//       redirectTo:"/landlord/kyc-details",
//     });
//   }



//   async verifyLandlordOtp(req: Request, res: Response): Promise<Response> {
//     logger.info("Landlord OTP verify START", {
//       email: req.body.email,
//       ip: req.ip,
//     });
//     const dto: verifyOtpDto = {
//       email: req.body.email,
//       otp: req.body.otp,
//     };

//     const kycData = await this._landlordAuthService.verifyLandlordOtp(dto);
//     logger.info("Landlord OTP verified SUCCESS", { email: req.body.email });
//     return res.status(HttpStatus.OK).json(
//       new ApiResponses(true, MESSAGES.AUTH.EMAIL_VERIFIED, {
//         kycData: kycData,
//         redirectTo: "/landlord/kyc",
//       }),
//     );
//   }

//   async resendOtp(req: Request, res: Response): Promise<Response> {
//     logger.info("OTP resend request", { email: req.body.email, ip: req.ip });
//     const dto: resendOtpDto = {
//       email: req.body.email,
//     };

//     await this._landlordAuthService.resendOtp(dto);
//     logger.info("OTP resend SUCCESS", { email: req.body.email });
//     return res
//       .status(HttpStatus.CREATED)
//       .json({ success: true, message: "New OTP sent to your email" });
//   }



//   async landlordLogin(req: Request, res: Response): Promise<Response> {
//     logger.info("Landlord login request", {
//       email: req.body.email,
//       ip: req.ip,
//     });

//     console.log("reached landlordlogin1");

//     const dto: UserLoginDto = {
//       email: req.body.email,
//       password: req.body.password,
//     };

//     const result = await this._landlordAuthService.landlordLogin(dto);

//     logger.info("Landlord login SUCCESS", {
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

//     console.log("landlord login controller completed", result.user);

//     return res.status(HttpStatus.OK).json({
//       success: true,
//       user: result.user,
//       tokens: result.tokens,
//       redirectTo: "/landlord/dashboard",
//     });
//   }



//   async landlordForgotPassword(req: Request, res: Response): Promise<Response> {
//     logger.info("Landlord forgot password START", {
//       email: req.body.email,
//       ip: req.ip,
//     });

//     const dto: forgotPasswordDto = {
//       email: req.body.email,
//     };

//     const result = await this._landlordAuthService.landlordForgotPassword(dto);
//     logger.info("Landlord forgot password OTP sent", { email: result.email });
//     return res.status(HttpStatus.OK).json(
//       new ApiResponses(true, "Reset OTP sent to email", {
//         email: result.email,
//         redirectTo: "/landlord/forgot-verify-otp",
//       }),
//     );
//   }

//   async refreshToken(req: Request, res: Response): Promise<Response> {
//     logger.info("Token refresh request");
//     console.log("refresh cpmtroller1", req.cookies.refreshToken);
//     const refreshToken = req.cookies.refreshToken;
//     console.log("refreshToken", refreshToken);
//     if (!refreshToken) {
//       throw new AppError("Refresh token required", HttpStatus.UNAUTHORIZED);
//     }

//     const result = await this._landlordAuthService.refreshToken(refreshToken);

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



 
//   async editLandlordProfile(
//     req: AuthRequest,
//     res: Response,
//   ): Promise<Response> {
   
//     logger.info("Landlord profile edit request", {
//       userId: req.user!.userId,
//       ip: req.ip,
//     });

//     const userId = req.user?.userId;
   

//     if (!userId) {
//       return res
//         .status(HttpStatus.UNAUTHORIZED)
//         .json(new ApiResponses(false, "User not authenticated"));
//     }

//     console.log("req file is", req.file);
//     let avatarUrl = null;
//     if (req.file) {
//       avatarUrl = await uploadToS3(req.file, "avatars", userId);
//     }
//     console.log("avatarUrl generated:", avatarUrl);

//     const dto: editLandlordProfileDto = {
//       firstName: req.body.firstName,
//       lastName: req.body.lastName,
//       phone: req.body.phone,
//       ...(avatarUrl && { avatar: avatarUrl }),
//     };

//     const result = await this._landlordAuthService.editLandlordProfile(dto, userId);

//     logger.info("Landlord profile updated SUCCESS", {
//       userId: result.user.id,
//       email: result.user.email,
//     });

  

//     return res.status(HttpStatus.OK).json(
//       new ApiResponses(true, "Profile updated successfully", {
//         user: result.user,
//       }),
//     );
//   }

 

//   async changeLandlordPassword(
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

//     const result = await this._landlordAuthService.changeLandlordPassword(dto, userId);

//     logger.info("Password changed SUCCESS", {
//       userId: result.user.id,
//       email: result.user.email,
//     });

//     return res.status(HttpStatus.OK).json(
//       new ApiResponses(true, "Password changed successfully", {
//         user: result.user,
//       }),
//     );
//   }

 



//   async submitLandlordKyc(req: Request, res: Response): Promise<Response> {
//     const email = req.body.email;
//     if (!email) {
//       return res.status(400).json(new ApiResponses(false, "Email required"));
//     }

//     const files = req.files as KycFiles;

//     const dto: SubmitLandlordKycDto = {
//       email,
//       aadhaarNumber: req.body.aadhaarNumber,
//       panNumber: req.body.panNumber,
//       files: {
//         aadhaarFront: files?.aadhaarFront?.[0] || null,
//         aadhaarBack: files?.aadhaarBack?.[0] || null,
//         panCard: files?.panCard?.[0] || null,
//         selfie: files?.selfie?.[0] || null,
//       },
//     };

//     if (!dto.files.aadhaarFront || !dto.files.panCard) {
//       return res
//         .status(400)
//         .json(new ApiResponses(false, "Aadhaar front & PAN card required"));
//     }

//     const result = await this._landlordAuthService.submitKyc(email, dto);

//     return res.status(201).json(
//       new ApiResponses(true, "KYC submitted successfully", {
//         kycId: result.kycId,
//         kycStatus: result.kycStatus,
//       }),
//     );
//   }

//   async getKycStatus(req: Request, res: Response): Promise<Response> {
   
//     logger.info("KYC status request", {
//       ip: req.ip,
//       email: req.query.email,
//     });

//     const dto: getKycStatusDto = {
//       email: req.query.email as string,
//     };

   

//     if (!dto.email) {
//       logger.warn("KYC status failed - email missing", { ip: req.ip });
//       return res
//         .status(HttpStatus.BAD_REQUEST)
//         .json(new ApiResponses(false, "Email required in query params"));
//     }

//     const result = await this._landlordAuthService.getKycStatus(dto);

//     logger.info("KYC status fetched SUCCESS", {
//       email: dto.email,
//       kycId: result.kycId,
//       kycStatus: result.kycStatus,
//     });
   
//     return res.status(HttpStatus.OK).json(
//       new ApiResponses(true, "KYC status fetched successfully", {
//         data: {
//           kycId: result.kycId,
//           kycStatus: result.kycStatus,
//           kycRejectedReason: result.kycRejectedReason,
//           // kycSubmittedAt: result.kycSubmittedAt
//         },
//       }),
//     );
//   }
// }
