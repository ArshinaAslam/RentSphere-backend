
import { injectable , inject } from "tsyringe";
import { DI_TYPES } from "../../../common/di/types";
import { ITenantRepository } from "../../../repositories/interface/tenant/ITenantRepository";
import bcrypt from 'bcryptjs'
import { HttpStatus } from "../../../common/enums/httpStatus.enum"
import { MESSAGES } from "../../../common/constants/statusMessages";
import { AppError } from "../../../common/errors/appError";



import logger from "../../../utils/logger";


import { ENV } from "../../../config/env";
import { ITenant } from "../../../models/tenantModel";
import { changePasswordDto, editTenantProfileDto } from "../../../dto/tenant/tenant.profile.dto";
import { EditTenantProfileResult, UserProfile } from "../../interface/tenant/ITenantAuthService";
import { ITenantProfileService } from "../../interface/tenant/ITenantProfileService";



@injectable()
export class tenantProfileService implements ITenantProfileService{
  constructor(
    @inject(DI_TYPES.TenantRepository)
    private readonly _userRepo : ITenantRepository,
   

     ){}


async editTenantProfile(dto:editTenantProfileDto,userId: string):Promise<{ user:UserProfile }> {
     logger.info('Tenant profile edit processing', { 
    userId, 
    firstName: dto.firstName,
    phone: dto.phone 
  });

  console.log("go from service1")
  const tenant = await this._userRepo.findById(userId);
  if (!tenant) {
    logger.warn('Profile edit failed - tenant not found', { userId });
    throw new AppError('Tenant not found', HttpStatus.NOT_FOUND);
  }


    const updateData: Partial<ITenant> = {
    firstName: dto.firstName,
    lastName: dto.lastName,
    phone: dto.phone,
    ...(dto.avatar && { avatar: dto.avatar }),
    updatedAt: new Date(),
  };


  const updatedTenant = await this._userRepo.update(userId, updateData);


 if (!updatedTenant) {
    logger.warn('Profile edit failed - tenant not found', { userId });
    throw new AppError('Tenant not found', HttpStatus.NOT_FOUND);
  }

  logger.info('Tenant profile updated successfully', { 
    userId: updatedTenant._id,
    email: updatedTenant.email 
  });


 console.log("go from service2")
   return {
    user: {
      id: updatedTenant._id.toString(),
      email: updatedTenant.email,
      role: updatedTenant.role as 'TENANT' | 'LANDLORD',
      fullName: `${updatedTenant.firstName} ${updatedTenant.lastName}`.trim(),
      avatar: updatedTenant.avatar || '',
      phone: updatedTenant.phone,
    }
  };
}











async changeTenantPassword(dto: changePasswordDto, userId: string): Promise<{ user: UserProfile }> {
  logger.info('Password change processing', { 
    userId, 
    newPasswordLength: dto.newPassword.length 
  });

  const tenant = await this._userRepo.findById(userId);
  console.log("password service1",tenant)
  if (!tenant) {
    logger.warn('Password change failed - tenant not found', { userId });
    throw new AppError('Tenant not found', HttpStatus.NOT_FOUND);
  }

  
  const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, tenant.passwordHash);
  if (!isCurrentPasswordValid) {
    logger.warn('Password change failed - invalid current password', { userId });
    throw new AppError('Current password is incorrect', HttpStatus.BAD_REQUEST);
  }

  
  if (dto.newPassword !== dto.confirmPassword) {
    throw new AppError('New passwords do not match', HttpStatus.BAD_REQUEST);
  }

  
  if (dto.newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', HttpStatus.BAD_REQUEST);
  }

  
  const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

  const updateData: Partial<ITenant> = {
    passwordHash: hashedPassword,
    updatedAt: new Date(),
  };

  const updatedTenant = await this._userRepo.update(userId, updateData);

  if (!updatedTenant) {
    logger.warn('Password change failed - tenant not found', { userId });
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }

  logger.info('Password changed successfully', { 
    userId: updatedTenant._id,
    email: updatedTenant.email 
  });
  console.log("password service2")


  return {
    user: {
      id: updatedTenant._id.toString(),
      email: updatedTenant.email,
      role: updatedTenant.role as 'TENANT' | 'LANDLORD',
      fullName: `${updatedTenant.firstName} ${updatedTenant.lastName}`.trim(),
      avatar: updatedTenant.avatar || '',
      phone: updatedTenant.phone,
    }
  };
}



}