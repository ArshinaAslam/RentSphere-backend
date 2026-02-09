import { Request, Response } from "express";
import { DI_TYPES } from "../../../../common/di/types";
import { IAuthService } from "../../services/interface/IAuthService";
import { IAuthController } from "../interface/IAuthController";
import { injectable, inject } from "tsyringe";
import { uploadToS3 } from "../../../../config/s3";
import {
  changePasswordDto,
  editLandlordProfileDto,
 
  editTenantProfileDto,
  forgotPasswordDto,
  getKycStatusDto,
  KycFiles,
  resendOtpDto,
  resetPasswordDto,
  SubmitKycDto,
  SubmitLandlordKycDto,
  UserLoginDto,
  UserSignupDto,
  verifyOtpDto,
  
} from "../../dto/tenantSignup.dto";
import { HttpStatus } from "../../../../common/enums/httpStatus.enum";
import { MESSAGES } from "../../../../common/constants/statusMessages";
import { ApiResponses } from "../../../../common/response/ApiResponse";
import { AppError } from "../../../../common/errors/appError";
import { AuthRequest } from "../../../../middleware/auth.middleware";
import logger from "../../../../utils/logger";

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject(DI_TYPES.AuthService)
    private readonly authService: IAuthService,
  ) {}

  async tenantSignup(req: Request, res: Response): Promise<Response> {


     logger.info('Tenant signup request', { 
      email: req.body.email,
      ip: req.ip 
    });


    const dto: UserSignupDto = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      role: req.body.role,
    };
    const data = await this.authService.tenantSignup(dto);

   logger.info('Tenant signup SUCCESS', { 
      email: data.email 
    })


    return res
      .status(HttpStatus.CREATED)
      .json(
        new ApiResponses(true, MESSAGES.AUTH.SIGNUP_SUCCESS, {
          email: data.email,
          redirectTo: "/tenant/verify-otp",
        }),
      );
  }

  async landlordSignup(req: Request, res: Response): Promise<Response> {
    logger.info('Landlord signup START', { email: req.body.email, ip: req.ip });
    const dto: UserSignupDto = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      role: req.body.role,
    };


    


    const data = await this.authService.landlordSignup(dto);

    logger.info('Landlord signup SUCCESS', { email: data.email });
    return res
      .status(HttpStatus.CREATED)
      .json(
        new ApiResponses(true, MESSAGES.AUTH.SIGNUP_SUCCESS, {
          email: data.email,
          redirectTo: "/landlord/verify-otp",
        }),
      );
  }



async googleAuth(req: Request, res: Response): Promise<Response> {
  logger.info('Google OAuth request', { 
    role: req.body.role, 
    email: req.body.email || 'unknown',
    ip: req.ip 
  });
  const { token, role } = req.body;
  
  const result = await this.authService.googleAuth({ token, role });
  
  
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

 logger.info('Google auth SUCCESS - cookies set', { 
    userId: result.user.id, 
    role,
    email: result.user.email 
  });

  return res.status(HttpStatus.OK).json({
    success: true,
    user: result.user,
    redirectTo: role === 'TENANT' ? '/tenant/dashboard' : '/landlord/dashboard'
  });
}
   






  async verifyTenantOtp(req: Request, res: Response): Promise<Response> {
    logger.info('Tenant OTP verify START', { email: req.body.email });
    
    const dto: verifyOtpDto= {
      email: req.body.email,
      otp: req.body.otp,
    };

    await this.authService.verifyTenantOtp(dto);
    logger.info('Tenant OTP verified SUCCESS', { email: req.body.email });
    return res
      .status(HttpStatus.CREATED)
      .json({
        success: true,
        message: MESSAGES.AUTH.EMAIL_VERIFIED,
        // redirectTo: "/tenant/login",
      });
  }


  async verifyLandlordOtp(req: Request, res: Response): Promise<Response> {
    logger.info('Landlord OTP verify START', { email: req.body.email, ip: req.ip });
  const dto: verifyOtpDto = {
    email: req.body.email,
    otp: req.body.otp
  };

  const kycData = await this.authService.verifyLandlordOtp(dto);
logger.info('Landlord OTP verified SUCCESS', { email: req.body.email });
  return res.status(HttpStatus.OK).json(
    new ApiResponses(true, MESSAGES.AUTH.EMAIL_VERIFIED, {
      kycData:kycData,
      redirectTo: '/landlord/kyc'
    })
  );
}


  async resendOtp(req: Request, res: Response): Promise<Response> {
    logger.info('OTP resend request', { email: req.body.email, ip: req.ip });
    const dto: resendOtpDto = {
      email: req.body.email,
    };

    await this.authService.resendOtp(dto);
logger.info('OTP resend SUCCESS', { email: req.body.email });
    return res
      .status(HttpStatus.CREATED)
      .json({ success: true, message: "New OTP sent to your email" });
  }




  async tenantLogin(req: Request, res: Response): Promise<Response> {


     logger.info('Tenant login request', { 
      email: req.body.email,
      ip: req.ip 
    });
   console.log("reached tenantlogin1")
    const dto: UserLoginDto = {
      email: req.body.email,
      password: req.body.password,
    };

    const result = await this.authService.tenantLogin(dto);



    logger.info('Tenant login SUCCESS', { 
      userId: result.user.id,
      email: result.user.email 
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
    
    console.log("login<<<>>>>>>",result.user);
    return res.status(HttpStatus.OK).json({
      success: true,
      user: result.user,
      tokens : result.tokens,
      redirectTo: "/tenant/dashboard"
         
    });
  }


async landlordLogin(req: Request, res: Response): Promise<Response> {
  logger.info('Landlord login request', { 
    email: req.body.email,
    ip: req.ip 
  });
  
  console.log("reached landlordlogin1");

  const dto: UserLoginDto = {
    email: req.body.email,
    password: req.body.password,
  };

  const result = await this.authService.landlordLogin(dto);

  logger.info('Landlord login SUCCESS', { 
    userId: result.user.id,
    email: result.user.email 
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
  
  console.log("landlord login controller completed", result.user);
  
  return res.status(HttpStatus.OK).json({
    success: true,
    user: result.user,
    tokens: result.tokens,
    redirectTo: "/landlord/dashboard" 
  });
}





  async tenantForgotPassword(req:Request,res:Response):Promise<Response>{
  logger.info('Forgot password START', { email: req.body.email, ip: req.ip });
    

    console.log("req.body",req.body)
    const dto : forgotPasswordDto = {
      email : req.body.email
    }

     

    const result = await this.authService.tenantForgotPassword(dto)
    logger.info('Forgot password OTP sent', { email: result.email });
    return res.status(HttpStatus.OK).json(new ApiResponses(true,"Reset OTP sent to email",{email:result.email,redirectTo:'/tenant/forgot-verify-otp'}))
  }


  async tenantResetPassword(req:Request,res:Response):Promise<Response>{
    logger.info('Tenant password reset START', { email: req.body.email, ip: req.ip });
  
    const dto : resetPasswordDto = {
      newPassword : req.body.password,
      email : req.body.email
    }

    const result = await this.authService.tenantResetPassword(dto)
logger.info('Tenant password reset SUCCESS', { email: req.body.email });
    return res.status(HttpStatus.OK).json(new ApiResponses(true,MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,{redirectTo:'/tenant/login'}))
  }


async landlordForgotPassword(req: Request, res: Response): Promise<Response> {
   logger.info('Landlord forgot password START', { email: req.body.email, ip: req.ip });
  
  const dto: forgotPasswordDto = {
    email: req.body.email,
  };

  const result = await this.authService.landlordForgotPassword(dto);
logger.info('Landlord forgot password OTP sent', { email: result.email });
  return res.status(HttpStatus.OK).json(
    new ApiResponses(true, "Reset OTP sent to email", {
      email: result.email,
      redirectTo: '/landlord/forgot-verify-otp'
    })
  );
}

  async refreshToken(req: Request, res: Response): Promise<Response> {
    logger.info('Token refresh request');
    console.log("refresh cpmtroller1",req.cookies.refreshToken)
    const refreshToken = req.cookies.refreshToken;
    console.log("refreshToken",refreshToken)
    if (!refreshToken) {
      throw new AppError("Refresh token required", HttpStatus.UNAUTHORIZED);
    }

    const result = await this.authService.refreshToken(refreshToken);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    console.log("refresh cpmtroller2")
    logger.info('Token refresh SUCCESS');
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Token refreshed", { success: true }));
  }

  // async logout(req: Request, res: Response): Promise<Response> {
    
  //   res.clearCookie("accessToken");
  //   res.clearCookie("refreshToken");
  //    console.log("cleared")
  //   return res
  //     .status(HttpStatus.OK)
  //     .json(new ApiResponses(true, "Logged out successfully", {}));
  // }


  async logout(req: Request, res: Response): Promise<Response> {
logger.info('Logout request', { 
      
      ip: req.ip 
    });
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",  
    maxAge: 0           
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0   
  });

  logger.info('Logout SUCCESS');

  return res
    .status(HttpStatus.OK)
    .json(new ApiResponses(true, "Logged out successfully", {}));
}


//   async getMe(req: AuthRequest, res: Response): Promise<Response> {
//     console.log("reached controller getme")
// logger.info('Profile fetch', { userId: req.user!.userId });
//     const userId = req.user!.userId;

//     console.log("controller userId",userId)
    
    
//     const user = await this.authService.getUser(userId);
//     logger.debug('Profile fetched', { userId: user.id });
//     console.log("getme<<<<<>>>>>",user)
//     return res.status(HttpStatus.OK).json(
//       new ApiResponses(true, "User profile fetched successfully", {
//         user: user
//       })
//     );


//   }


async getMe(req: AuthRequest, res: Response): Promise<Response> {
  console.log("reached controller getme");
  
  // ✅ req.user.role comes from your authenticateToken middleware!
  const { userId, role } = req.user!;
  
  console.log("controller userId:", userId, "role:", role);
  
  const user = await this.authService.getUser(userId, role);
  
  return res.status(HttpStatus.OK).json(
    new ApiResponses(true, "User profile fetched successfully", {
      user: user
    })
  );
}




  async editTenantProfile(req:AuthRequest,res:Response):Promise<Response>{
    logger.info('Tenant profile edit request', { 
    userId: req.user!.userId,
    ip: req.ip 
  });
   
   const userId =  req.user?.userId
    console.log("reached controler",userId)
   if (!userId) {
    return res.status(HttpStatus.UNAUTHORIZED).json(
        new ApiResponses(false, 'User not authenticated')
    );
}

 console.log("req fil is",req.file)
let avatarUrl = null;
  if (req.file) { 
    avatarUrl = await uploadToS3(req.file, 'avatars', userId);  
  }
console.log("hiibyyy")
 
const dto:editTenantProfileDto = {
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      phone:req.body.phone,
       ...(avatarUrl && { avatar: avatarUrl })
    }


    const result = await this.authService.editTenantProfile(dto,userId)

    
  logger.info('Tenant profile updated SUCCESS', { 
    userId: result.user.id,
    email: result.user.email 
  });

  console.log("gonr from controller",result.user)

   return res.status(HttpStatus.OK).json(
    new ApiResponses(true, 'Profile updated successfully', {
      user: result.user,
    })
  );
  ;
  }


  async editLandlordProfile(req: AuthRequest, res: Response): Promise<Response> {
    console.log("hybycontro1")
  logger.info('Landlord profile edit request', { 
    userId: req.user!.userId,
    ip: req.ip 
  });
  
  const userId = req.user?.userId;
  console.log("hybycontro2",userId)
  
  if (!userId) {
    return res.status(HttpStatus.UNAUTHORIZED).json(
      new ApiResponses(false, 'User not authenticated')
    );
  }

  console.log("req file is", req.file);
  let avatarUrl = null;
  if (req.file) { 
    avatarUrl = await uploadToS3(req.file, 'avatars', userId);  
  }
  console.log("avatarUrl generated:", avatarUrl);

  const dto: editLandlordProfileDto = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    ...(avatarUrl && { avatar: avatarUrl })
  };

  const result = await this.authService.editLandlordProfile(dto, userId);

  logger.info('Landlord profile updated SUCCESS', { 
    userId: result.user.id,
    email: result.user.email 
  });

  console.log("hybycontro3",result)

  return res.status(HttpStatus.OK).json(
    new ApiResponses(true, 'Profile updated successfully', {
      user: result.user,
    })
  );
}


async changeTenantPassword(req: AuthRequest, res: Response): Promise<Response> {
  
  logger.info('Password change request', { 
    userId: req.user!.userId,
    ip: req.ip 
  });

  const dto: changePasswordDto = {
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
    confirmPassword: req.body.confirmPassword
    
  };

  const userId = req.user?.userId;
  if (!userId) {
    return res.status(HttpStatus.UNAUTHORIZED).json(
      new ApiResponses(false, 'User not authenticated')
    );
  }

  const result = await this.authService.changeTenantPassword(dto, userId);

  logger.info('Password changed SUCCESS', { 
    userId: result.user.id,
    email: result.user.email 
  });
console.log("1234")
  return res.status(HttpStatus.OK).json(
    new ApiResponses(true, 'Password changed successfully', {
      user: result.user,
    })
  );
}



async changeLandlordPassword(req: AuthRequest, res: Response): Promise<Response> {
  console.log("changecontro1")
  logger.info('Password change request', { 
    userId: req.user!.userId,
    ip: req.ip 
  });

  const dto: changePasswordDto = {
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
    confirmPassword: req.body.confirmPassword
    
  };

  const userId = req.user?.userId;
  if (!userId) {
    return res.status(HttpStatus.UNAUTHORIZED).json(
      new ApiResponses(false, 'User not authenticated')
    );
  }

  const result = await this.authService.changeLandlordPassword(dto, userId);

  logger.info('Password changed SUCCESS', { 
    userId: result.user.id,
    email: result.user.email 
  });
 console.log("changecontro2",result.user)
  return res.status(HttpStatus.OK).json(
    new ApiResponses(true, 'Password changed successfully', {
      user: result.user,
    })
  );
}


async adminLogin(req: Request, res: Response): Promise<Response> {
  logger.info('Admin login request', { 
    email: req.body.email,
    ip: req.ip 
  });

  const dto: UserLoginDto = {
    email: req.body.email,
    password: req.body.password,
  };

  const result = await this.authService.adminLogin(dto);

  logger.info('Admin login SUCCESS', { 
    userId: result.user.id,
    email: result.user.email 
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
    redirectTo: "/admin/dashboard"
  });
}




// async submitLandlordKyc(req: AuthRequest, res: Response): Promise<Response> {
//   console.log("reached kyc controlelr1")
//   logger.info('Landlord KYC submission', { 
//     userId: req.user!.userId,
//     ip: req.ip 
//   });

//   const userId = req.user!.userId;
//  console.log("reached kyc controlelr2",userId)

// const files = req.files as KycFiles;
//  console.log("reached kyc controlelr3",files)
  
//   const dto: SubmitLandlordKycDto = {
//     email: req.body.email,
//     aadhaarNumber: req.body.aadhaarNumber,
//     panNumber: req.body.panNumber,
//      files: {
//     aadhaarFront: files?.aadhaarFront?.[0] || null,  
//     aadhaarBack: files?.aadhaarBack?.[0] || null,
//     panCard: files?.panCard?.[0] || null,
//     selfie: files?.selfie?.[0] || null,
//   },
//   };

 
//   if (!dto.files.aadhaarFront || !dto.files.panCard) {
//     logger.warn('KYC missing required files', { userId });
//     return res.status(400).json(
//       new ApiResponses(false, 'Aadhaar front & PAN card required')
//     );
//   }

 
//   const result = await this.authService.submitKyc(userId, dto);

//   logger.info('Landlord KYC submitted SUCCESS', { 
//     userId, 
//     kycId: result.kycId 
//   });
 
//    console.log("reached kyc controlelr4",result)
  
//   return res.status(201).json(
//     new ApiResponses(true, 'KYC submitted successfully', {
//       kycId: result.kycId,
//     })
//   );
// }


async submitLandlordKyc(req: Request, res: Response): Promise<Response> {
  console.log("✅ KYC Controller reached");
  
  // ✅ FIND USER BY EMAIL (no auth needed)
  const email = req.body.email;
  if (!email) {
    return res.status(400).json(
      new ApiResponses(false, 'Email required')
    );
  }

  // ✅ Get user by email


  const files = req.files as KycFiles;
  console.log("✅ Files received:", files);

  const dto: SubmitLandlordKycDto = {
    email,
    aadhaarNumber: req.body.aadhaarNumber,
    panNumber: req.body.panNumber,
    files: {
      aadhaarFront: files?.aadhaarFront?.[0] || null,
      aadhaarBack: files?.aadhaarBack?.[0] || null,
      panCard: files?.panCard?.[0] || null,
      selfie: files?.selfie?.[0] || null,
    },
  };

  if (!dto.files.aadhaarFront || !dto.files.panCard) {
    return res.status(400).json(
      new ApiResponses(false, 'Aadhaar front & PAN card required')
    );
  }

  const result = await this.authService.submitKyc(email, dto);
  
  return res.status(201).json(
    new ApiResponses(true, 'KYC submitted successfully', {
      kycId: result.kycId,kycStatus:result.kycStatus
    })
  );
}


async getKycStatus(req: Request, res: Response): Promise<Response> {
  console.log("check1")
  logger.info('KYC status request', { 
    ip: req.ip,
    email: req.query.email 
  });

  const dto: getKycStatusDto = {
    email: req.query.email as string  
  };

  console.log("check2 email",dto.email)

  if (!dto.email) {
    logger.warn('KYC status failed - email missing', { ip: req.ip });
    return res.status(HttpStatus.BAD_REQUEST).json(
      new ApiResponses(false, 'Email required in query params')
    );
  }

  const result = await this.authService.getKycStatus(dto);

  logger.info('KYC status fetched SUCCESS', { 
    email: dto.email,
    kycId: result.kycId,
    kycStatus: result.kycStatus 
  });
console.log("check3 bue",result)
  return res.status(HttpStatus.OK).json(
    new ApiResponses(true, 'KYC status fetched successfully', {
      data: {  
        kycId: result.kycId,
        kycStatus: result.kycStatus,
        kycRejectedReason: result.kycRejectedReason,
        // kycSubmittedAt: result.kycSubmittedAt
      }
    })
  );
}



}



