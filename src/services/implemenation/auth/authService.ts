import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { ENV } from "../../../config/env";
import {
  forgotPasswordDto,
  LoginDto,
  LoginResultDto,
  resendOtpDto,
  resetPasswordDto,
  SignupDto,
  verifyOtpDto,
} from "../../../dto/auth/auth.dto";
import { UserMapper } from "../../../mappers/user.mapper";
import { ILandlord } from "../../../models/landlordModel";
import { ITenant } from "../../../models/tenantModel";
import { UserRole } from "../../../types/auth.types";
import { IUserRepoMap } from "../../../types/repository.types";
import logger from "../../../utils/logger";
import {
  IAuthService,
  SignupResult,
  verifyOtpResult,
} from "../../interface/auth/IAuthService";
import { IEmailService } from "../../interface/IEmailService";
import { IRedisService } from "../../interface/IRedisService";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(DI_TYPES.RedisService)
    private readonly _redisService: IRedisService,
    @inject(DI_TYPES.EmailService)
    private readonly _emailService: IEmailService,
    @inject(DI_TYPES.UserRepoMap)
    private repos: IUserRepoMap,
  ) {}

  private getRepository(role: UserRole) {
    const repo = this.repos[role];
    if (!repo) {
      throw new AppError(`Invalid user role: ${role}`, HttpStatus.BAD_REQUEST);
    }
    return repo;
  }

  async googleAuth({
    token,
    role,
  }: {
    token: string;
    role: UserRole;
  }): Promise<LoginResultDto> {
    logger.info("Google OAuth processing", { role });
    const repo = this.getRepository(role);
    const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: ENV.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    logger.warn("Google OAuth failed - invalid token", { role });
    if (!payload) {
      throw new AppError("Invalid Google token", HttpStatus.UNAUTHORIZED);
    }

    const {
      email,
      given_name: firstName = "",
      family_name: lastName = "",
      picture: avatar,
      sub: googleId,
    } = payload;

    if (!email) {
      logger.warn("Google OAuth failed - no email", {
        role,
        googleId: googleId?.substring(0, 8),
      });
      throw new AppError(
        "Google account must have an email associated",
        HttpStatus.BAD_REQUEST,
      );
    }

    logger.debug("Google user data", {
      email,
      role,
      googleId: googleId?.substring(0, 8),
    });

    let user = await repo.findByEmail(email);

    if (!user) {
      logger.info("Google OAuth - creating new user", { email, role });
      const newUserData: Partial<ITenant | ILandlord> = {
        firstName: firstName || "User",
        lastName: lastName || "",
        email,
        role: role,
        avatar: avatar || "",
        googleId,
        isEmailVerified: true,
        isActive: true,
        phone: "",
      };

      logger.info("Google user created", { email, role });
      user = await repo.create(newUserData);
    }

    const existingUser = await repo.findByEmail(email);

    if (existingUser && existingUser.role !== role) {
      logger.warn("Google OAuth blocked - role conflict", {
        email,
        requestedRole: role,
        existingRole: existingUser.role,
      });
      throw new AppError(
        "Email already registered with different role",
        HttpStatus.CONFLICT,
      );
    }

    const payloadJwt = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    };
    const accessToken = jwt.sign(payloadJwt, ENV.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payloadJwt, ENV.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    logger.info("Google OAuth complete - tokens generated", {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    return {
      user: UserMapper.toResponseDto(user),
      tokens: { accessToken, refreshToken },
    };
  }

  async signup(dto: SignupDto): Promise<SignupResult> {
    logger.info("signup processing", { email: dto.email });
    const repo = this.getRepository(dto.role);
    const existing = await repo.findByEmail(dto.email);
    if (existing?.isEmailVerified) {
      logger.warn("signup blocked - email exists", { email: dto.email });
      throw new AppError(MESSAGES.AUTH.EMAIL_EXISTS, HttpStatus.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await repo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: dto.role,
      kycStatus: "PENDING",
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    logger.debug("OTP generated", {
      email: dto.email,
    });
    await this._redisService.setOtp(user.email, otp);
    logger.debug(`OTP for testing: ${otp}`, { email: user.email });
    await this._redisService.setResendLock(user.email);
    await this._emailService.sendOtpEmail(user.email, otp);

    logger.info("user signup complete", {
      email: user.email,
      userId: String(user._id),
      kycStatus: "PENDING",
    });

    return { email: user.email, otpSent: true };
  }

  async verifyOtp(dto: verifyOtpDto): Promise<verifyOtpResult> {
    logger.info("Lnadord OTP verification", { email: dto.email });

    const repo = this.getRepository(dto.role);
    const storedOtp = await this._redisService.getOtp(dto.email);
    if (!storedOtp) {
      logger.warn("user OTP verification failed - expired", {
        email: dto.email,
      });
      throw new AppError("OTP Expired", HttpStatus.BAD_REQUEST);
    }
    if (storedOtp !== dto.otp) {
      logger.warn("user OTP verification failed - invalid", {
        email: dto.email,
        providedOtp: dto.otp.substring(0, 3) + "***",
        storedOtp: storedOtp.substring(0, 3) + "***",
      });
      throw new AppError("Invalid OTP", HttpStatus.BAD_REQUEST);
    }

    await this._redisService.deleteOtp(dto.email);
    await repo.updateByEmail(dto.email, {
      isEmailVerified: true,
    });

    const user = await repo.findByEmail(dto.email);
    if (!user) throw new AppError("user not found", HttpStatus.NOT_FOUND);
    logger.info("user OTP verified successfully", { email: dto.email });
    return {
      fullName: `${user.firstName} ${user.lastName}`,

      email: user.email,
      phone: user.phone,
    };
  }

  async resendOtp(dto: resendOtpDto): Promise<{ success: boolean }> {
    logger.info("OTP resend request", { email: dto.email });

    const repo = this.getRepository(dto.role);

    const existing = await repo.findByEmail(dto.email);

    if (!existing) {
      logger.warn("OTP resend failed - user not found", { email: dto.email });
      throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
    }

    const canResend = await this._redisService.canResendOtp(dto.email);
    if (!canResend) {
      logger.warn("OTP resend blocked - rate limited", { email: dto.email });
      throw new AppError(
        "Please wait before requesting new OTP",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    logger.debug("OTP regenerated for resend", {
      email: dto.email,
      otpMasked: otp.substring(0, 3) + "***",
    });

    await this._redisService.setOtp(dto.email, otp);
    await this._redisService.setResendLock(dto.email);
    logger.debug(`RESEND-OTP for testing: ${otp}`, { email: dto.email });
    await this._emailService.sendOtpEmail(dto.email, otp);

    logger.info("OTP resend success", {
      email: dto.email,
      role: existing.role,
    });
    return { success: true };
  }

  async login(dto: LoginDto): Promise<LoginResultDto> {
    logger.info("user login validation", { email: dto.email });

    const repo = this.getRepository(dto.role);
    const user = await repo.findByEmail(dto.email);
    if (!user) {
      logger.warn("Login failed - user not found", { email: dto.email });
      throw new AppError("Email not exist", HttpStatus.UNAUTHORIZED);
    }

    if (!user.isEmailVerified) {
      logger.warn("Login failed - unverified user", { email: dto.email });
      throw new AppError("Email is not verified", HttpStatus.UNAUTHORIZED);
    }

    if (!user.isActive) {
      logger.warn("Login failed - inactive user", { email: dto.email });
      throw new AppError("Email is inactive", HttpStatus.UNAUTHORIZED);
    }

    const isValidPassword = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      logger.warn("Login failed - wrong password", { email: dto.email });
      throw new AppError("Password is incorrect", HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    logger.info("user login success", {
      userId: String(user._id),
      email: user.email,
    });

    return {
      user: UserMapper.toResponseDto(user),
      tokens: { accessToken, refreshToken },
    };
  }

  async resetPassword(dto: resetPasswordDto): Promise<{ success: boolean }> {
    logger.info("Password reset processing", { email: dto.email });
    const repo = this.getRepository(dto.role);

    const user = await repo.findByEmail(dto.email);

    if (!user) {
      throw new AppError("user not found", HttpStatus.NOT_FOUND);
    }

    const isSameAsOldPassword = await bcrypt.compare(
      dto.newPassword,
      user.passwordHash,
    );
    if (isSameAsOldPassword) {
      throw new AppError(
        "New password cannot be the same as your old password",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.newPassword.length < 8) {
      throw new AppError(
        "New password must be at least 8 characters",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!/[A-Z]/.test(dto.newPassword)) {
      throw new AppError(
        "Password must contain at least one uppercase letter",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!/[a-z]/.test(dto.newPassword)) {
      throw new AppError(
        "Password must contain at least one lowercase letter",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!/[0-9]/.test(dto.newPassword)) {
      throw new AppError(
        "Password must contain at least one number",
        HttpStatus.BAD_REQUEST,
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await repo.updateByEmail(dto.email, { passwordHash });

    logger.info("Password reset success", {
      email: dto.email,
      userId: String(user._id),
      role: user.role,
    });
    return { success: true };
  }

  async forgotPassword(
    dto: forgotPasswordDto,
  ): Promise<{ email: string; otpSent: boolean }> {
    logger.info("user forgot password", { email: dto.email });
    const repo = this.getRepository(dto.role);
    const user = await repo.findByEmail(dto.email);
    if (!user) {
      logger.warn("Forgot password failed - invalid user", {
        email: dto.email,
        exists: !!user,
      });
      throw new AppError(
        "No account found with this email address",
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.isEmailVerified) {
      logger.warn("Forgot password failed - invalid email", {
        email: dto.email,

        verified: user?.isEmailVerified,
      });
      throw new AppError("Email not not verified", HttpStatus.UNAUTHORIZED);
    }

    if (!user.isActive) {
      logger.warn("Forgot password failed - invalid user", {
        email: dto.email,

        active: user?.isActive,
      });
      throw new AppError(
        "Your account is currently inactive",
        HttpStatus.UNAUTHORIZED,
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    logger.debug("Reset OTP generated", {
      email: dto.email,
      otpMasked: otp.substring(0, 3) + "***",
    });
    await this._redisService.setOtp(user.email, otp);
    logger.debug(`OTP for testing: ${otp}`, { email: user.email });
    await this._redisService.setResendLock(user.email);
    await this._emailService.sendOtpEmail(user.email, otp);
    logger.info("Forgot password OTP sent", { email: user.email });
    return {
      email: user.email,
      otpSent: true,
    };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    logger.info("Token refresh processing");

    const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    logger.debug("Refresh token decoded", { userId: decoded.userId });
    const payload = {
      _id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    const newAccessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });

    logger.info("Token refresh success", { userId: decoded.userId });

    return { accessToken: newAccessToken };
  }
}
