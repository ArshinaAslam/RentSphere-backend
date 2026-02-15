

import { injectable , inject } from "tsyringe";
import { DI_TYPES } from "../../../common/di/types";
import { ITenantRepository } from "../../../repositories/interface/tenant/ITenantRepository";
import bcrypt from 'bcryptjs'
import { HttpStatus } from "../../../common/enums/httpStatus.enum"
import { MESSAGES } from "../../../common/constants/statusMessages";
import { AppError } from "../../../common/errors/appError";
import { IRedisService } from "../../interface/IRedisService";
import { IEmailService } from "../../interface/IEmailService";



import logger from "../../../utils/logger";




import { ILandlord } from "../../../models/landlordModel";
import { ILandlordRepository } from "../../../repositories/interface/landlord/ILandlordRepository";
import { changePasswordDto, editLandlordProfileDto } from "../../../dto/landlord/landlord.profile.dto";
import { LandlordProfile } from "../../interface/landlord/ILandlordAuthService";
import { ILandlordProfileService } from "../../interface/landlord/ILandlordProfileService";





function validateAadhaar(number: string): void {
  if (!/^\d{12}$/.test(number)) {
    throw new AppError('Invalid Aadhaar format', 400);
  }
}

function validatePan(number: string): void {
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(number)) {
    throw new AppError('Invalid PAN format', 400);
  }
}



@injectable()
export class LandlordProfileService implements ILandlordProfileService{
  constructor(
    @inject(DI_TYPES.RedisService)
    private readonly _redisService: IRedisService,
    @inject(DI_TYPES.EmailService)
    private readonly _emailService:IEmailService,
    @inject(DI_TYPES.LandlordRepository)
    private readonly _landlordRepo : ILandlordRepository,
     ){}

 
   
async editLandlordProfile(dto: editLandlordProfileDto, userId: string): Promise<{ user: LandlordProfile }> {
  logger.info('Landlord profile edit processing', { 
    userId, 
    firstName: dto.firstName,
    phone: dto.phone 
  });

   console.log("hybyservice1")
  
  const landlord = await this._landlordRepo.findById(userId);
  if (!landlord) {
    logger.warn('Profile edit failed - landlord not found', { userId });
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }
  console.log("hybyservice2",landlord)
  const updateData: Partial<ILandlord> = {
    firstName: dto.firstName,
    lastName: dto.lastName,
    phone: dto.phone,
    ...(dto.avatar && { avatar: dto.avatar }),
    updatedAt: new Date(),
  };

  const updatedLandlord = await this._landlordRepo.update(userId, updateData);

  if (!updatedLandlord) {
    logger.warn('Profile edit failed - landlord not found', { userId });
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }

  logger.info('Landlord profile updated successfully', { 
    userId: updatedLandlord._id,
    email: updatedLandlord.email 
  });

console.log("hybyservice3")
  
  return {
    user: {
      id: updatedLandlord._id.toString(),
      email: updatedLandlord.email,
      role: updatedLandlord.role as 'TENANT' | 'LANDLORD',
      fullName: `${updatedLandlord.firstName} ${updatedLandlord.lastName}`.trim(),
      avatar: updatedLandlord.avatar || '',
      phone: updatedLandlord.phone,
    }
  };
}



async changeLandlordPassword(dto: changePasswordDto, userId: string): Promise<{ user: LandlordProfile }> {
  logger.info('Password change processing', { 
    userId, 
    newPasswordLength: dto.newPassword.length 
  });

   console.log("changeservice1")

  const landlord = await this._landlordRepo.findById(userId);
  console.log("password service1",landlord)
  if (!landlord) {
    logger.warn('Password change failed - landlord not found', { userId });
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }

  
  const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, landlord.passwordHash);
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

  const updateData: Partial<ILandlord> = {
    passwordHash: hashedPassword,
    updatedAt: new Date(),
  };

  const updatedLandlord = await this._landlordRepo.update(userId, updateData);

  if (!updatedLandlord) {
    logger.warn('Password change failed - landlord not found', { userId });
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }

  logger.info('Password changed successfully', { 
    userId: updatedLandlord._id,
    email: updatedLandlord.email 
  });
     console.log("changeservice2",updatedLandlord)


  return {
    user: {
      id: updatedLandlord._id.toString(),
      email: updatedLandlord.email,
      role: updatedLandlord.role as 'TENANT' | 'LANDLORD',
      fullName: `${updatedLandlord.firstName} ${updatedLandlord.lastName}`.trim(),
      avatar: updatedLandlord.avatar || '',
      phone: updatedLandlord.phone,
    }
  };
}





}