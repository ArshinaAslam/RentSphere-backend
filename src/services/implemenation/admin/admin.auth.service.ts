import { injectable , inject } from "tsyringe";
import { DI_TYPES } from "../../../common/di/types";
import bcrypt from 'bcryptjs'
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { MESSAGES } from "../../../common/constants/statusMessages";
import { AppError } from "../../../common/errors/appError";
import jwt from 'jsonwebtoken';


import { ENV } from "../../../config/env";
import logger from "../../../utils/logger";
import { IAdminRepository } from "../../../repositories/interface/admin/IAdminReposiory";
import { AdminLoginDto } from "../../../dto/admin/admin.auth.dto";
import { AdminLoginResult, IAdminAuthService } from "../../interface/admin/IAdminAuthService";






@injectable()
export class AdminAuthService implements IAdminAuthService{
  constructor(
   
    @inject (DI_TYPES.AdminRepository)
   private readonly _adminRepo:IAdminRepository
     ){}

 

async adminLogin(dto: AdminLoginDto): Promise<AdminLoginResult> {
  logger.info('Admin login validation', { email: dto.email });
  
  
  const admin = await this._adminRepo.findByEmail(dto.email);
  
  if (!admin) {
    logger.warn('Admin login failed - admin not found', { email: dto.email });
    throw new AppError('Invalid Email', HttpStatus.UNAUTHORIZED);
  }

  
  if (!admin.isActive) {
    logger.warn('Admin login failed - inactive admin', { email: dto.email });
    throw new AppError('Account is inactive. Contact support.', HttpStatus.UNAUTHORIZED);
  }

  
  const isValidPassword = await bcrypt.compare(dto.password, admin.passwordHash);
  if (!isValidPassword) {
    logger.warn('Admin login failed - wrong password', { email: dto.email });
    throw new AppError('Wrong Password', HttpStatus.UNAUTHORIZED);
  }

  
  const payload = { 
    userId: admin._id, 
    email: admin.email, 
    role: 'ADMIN' 
  };
  const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  logger.info('Admin login success', { userId: admin._id, email: admin.email });

  return {
    user: { 
      id: admin._id.toString(), 
      email: admin.email, 
      role: 'ADMIN' as const,
     
    },
    tokens: { accessToken, refreshToken }
  };
}



async refreshAdminToken(refreshToken:string):Promise<{ accessToken: string }>{
logger.info('Token refresh processing');
console.log("refresh service1",refreshToken)
   const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET!) as {
    userId: string;
    email: string;
    role: string;
  };

  logger.debug('Refresh token decoded', { userId: decoded.userId });
  const payload = {_id:decoded.userId,email:decoded.email,role:decoded.role}
  const newAccessToken = jwt.sign(
    payload,
    ENV.JWT_ACCESS_SECRET,
    {expiresIn:'15m'}
  )

logger.info('Token refresh success', { userId: decoded.userId });
console.log("refresh service2")

  return {accessToken:newAccessToken}




}


}