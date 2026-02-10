import { injectable, inject } from 'tsyringe';
import { Types, FilterQuery } from 'mongoose';
import { ITenantRepository } from '../../../../shared/repositories/interface/ITenantRepository';
import { IUserService, UsersListResult, UserStatusResult } from '../interface/IUserService';
import { GetUsersDto, LandlordDetailsDto, ToggleUserStatusDto } from '../../dto/users.dto';
import { AppError } from '../../../../common/errors/appError';
import logger from '../../../../utils/logger';
import { HttpStatus } from '../../../../common/enums/httpStatus.enum';
import { DI_TYPES } from '../../../../common/di/types';
import { ITenant } from '../../../../models/tenantModel';
import { ILandlordRepository } from '../../../../shared/repositories/interface/ILandlordRepository';
import { ILandlord } from '../../../../models/landlordModel';



export const generateUserId = (id: string) => {
  return `USR-${id.slice(-4).padStart(4, '0')}`;
};

export function extractMongoIdFromTenantId(tenantId: string): string {
  if (!tenantId.startsWith('USR-')) {
    throw new Error('Invalid tenantId format');
  }
  return tenantId.slice(4);  // "USR-1234" → "1234"
}

@injectable()
export default class UserService implements IUserService {
  constructor(
    @inject(DI_TYPES.TenantRepository)
    private tenantRepo: ITenantRepository,
    @inject(DI_TYPES.LandlordRepository)
    private landlordRepo:ILandlordRepository
  ) {}

//   async getUsers(dto: GetUsersDto): Promise<UsersListResult> {
//     logger.info('Admin fetching users', {
//        role: dto.role ?? 'TENANT',
//       search: dto.search,
//       page: dto.page ?? 1,
//     });

  
//     const query: FilterQuery<ITenant> = {
//       role: dto.role ?? 'TENANT',
//     };

   
    
//     if (dto.search) {
//       query.$or = [
//         { firstName: { $regex: dto.search, $options: 'i' } },
//         { lastName: { $regex: dto.search, $options: 'i' } },
//         { email: { $regex: dto.search, $options: 'i' } },
//       ];
//     }

//     const page = dto.page ?? 1;
//     const limit = dto.limit ?? 10;
//     const skip = (page - 1) * limit;

//     const [users, total] = await Promise.all([
//       this.userRepo
//         .findMany(query)
//         .select('-passwordHash')
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),

//       this.userRepo.count(query),
//     ]);

//     const formattedUsers = users.map((user) => ({
//       id: user._id.toString(),
//       // tenantId: `USR-${user._id.toString().slice(-4).padStart(4, '0')}`,
//       tenantId:generateUserId(user._id.toString()),
//       fullName: `${user.firstName} ${user.lastName}`,
//       email: user.email,
//       phone: user.phone ?? '',
//       avatar:user.avatar,
//       status: (user.isActive ? 'active' : 'blocked') as 'active' | 'blocked',
//       kycStatus: user.kycStatus ?? 'NOT_SUBMITTED',
      
//     }));
//  console.log("?????????",formattedUsers)
//     return {
//       users: formattedUsers,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     };
//   }

  async getTenants(dto: GetUsersDto): Promise<UsersListResult> {
    logger.info('Admin fetching tenants', {
      search: dto.search,
      page: dto.page ?? 1,
    });

    const query: FilterQuery<ITenant> = { role: 'TENANT' };
    if (dto.search) {
      query.$or = [
        { firstName: { $regex: dto.search, $options: 'i' } },
        { lastName: { $regex: dto.search, $options: 'i' } },
        { email: { $regex: dto.search, $options: 'i' } },
      ];
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const [tenants, total] = await Promise.all([
      this.tenantRepo
        .findMany(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.tenantRepo.count(query),
    ]);

    const formattedTenants = tenants.map((tenant) => ({
      id: tenant._id.toString(),
      tenantId: generateUserId(tenant._id.toString()),
      fullName: `${tenant.firstName} ${tenant.lastName}`,
      email: tenant.email,
      phone: tenant.phone ?? '',
      avatar: tenant.avatar,
      status: (tenant.isActive ? 'active' : 'blocked') as 'active' | 'blocked',
      kycStatus: tenant.kycStatus ?? 'NOT_SUBMITTED',
    }));

    logger.info(`Fetched ${tenants.length} tenants`, { total, page });
    return {
      users: formattedTenants,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

 
  async getLandlords(dto: GetUsersDto): Promise<UsersListResult> {
    logger.info('Admin fetching landlords', {
      search: dto.search,
      page: dto.page ?? 1,
    });

    const query: FilterQuery<ILandlord> = { role: 'LANDLORD' };
    if (dto.search) {
      query.$or = [
        { firstName: { $regex: dto.search, $options: 'i' } },
        { lastName: { $regex: dto.search, $options: 'i' } },
        { email: { $regex: dto.search, $options: 'i' } },
      ];
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;

    const [landlords, total] = await Promise.all([
      this.landlordRepo
        .findMany(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.landlordRepo.count(query),
    ]);

    const formattedLandlords = landlords.map((landlord) => ({
      id: landlord._id.toString(),
      tenantId: generateUserId(landlord._id.toString()),
      fullName: `${landlord.firstName} ${landlord.lastName}`,
      email: landlord.email,
      phone: landlord.phone ?? '',
      avatar: landlord.avatar,
      status: (landlord.isActive ? 'active' : 'blocked') as 'active' | 'blocked',
      kycStatus: landlord.kycStatus ?? 'NOT_SUBMITTED',
    }));

    logger.info(`Fetched ${landlords.length} landlords`, { total, page });
    return {
      users: formattedLandlords,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }


async getLandlordDetails(id: string): Promise<LandlordDetailsDto> {
  console.log("signlervice1",id)
  logger.info('Fetching single landlord by ID', { id });

  const landlord = await this.landlordRepo.findById(id);
  
  if (!landlord) {
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }

  
  const landlordDetails: LandlordDetailsDto = {
    id: landlord._id.toString(),
    landlordId: generateUserId(landlord._id.toString()),
    fullName: `${landlord.firstName} ${landlord.lastName}`,
    email: landlord.email,
    phone: landlord.phone ?? '',
    avatar: landlord.avatar ?? '',
    status: (landlord.isActive ? 'active' : 'blocked') as 'active' | 'blocked',
    kycStatus: landlord.kycStatus ?? 'NOT_SUBMITTED',
    
    aadharNumber: landlord.kycDetails?.aadhaarNumber || '',
    panNumber: landlord.kycDetails?.panNumber || '',
    aadharFrontUrl: landlord.kycDocuments?.aadhaarFront || '',
    aadharBackUrl: landlord.kycDocuments?.aadhaarBack || '',
    panFrontUrl: landlord.kycDocuments?.panCard || '',
    liveSelfie :landlord.kycDocuments?.liveSelfie || '',
    kycRejectedReason: landlord.kycRejectedReason || '',
  };

  logger.info('Single landlord fetched successfully', { 
    id, 
    fullName: landlordDetails.fullName 
  });
console.log("siglelandlorddeatils",landlordDetails)
  return landlordDetails;
}


async approveLandlordKyc(landlordId: string): Promise<LandlordDetailsDto> {
  console.log("Service: Approving KYC for:", landlordId);
  
  const landlord = await this.landlordRepo.updateLandlordById(landlordId, {
    kycStatus: 'APPROVED',
    isActive: true,  
    kycRejectedReason: '' 
  });

  if (!landlord) {
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }

  logger.info('KYC approved and landlord activated', { landlordId });
  console.log("approvekycservice2")
  return this.getLandlordDetails(landlordId); 
}


async rejectLandlordKyc(landlordId: string, reason: string): Promise<LandlordDetailsDto> {
  console.log("Service: Rejecting KYC for:", landlordId);
  
  const landlord = await this.landlordRepo.updateLandlordById(landlordId, {
    kycStatus: 'REJECTED',
    kycRejectedReason: reason || 'Documents not clear'
  });

  if (!landlord) {
    throw new AppError('Landlord not found', HttpStatus.NOT_FOUND);
  }
console.log("rejectkycservice2",landlord)
  logger.info('KYC rejected', { landlordId });
  return this.getLandlordDetails(landlordId);
}



async toggleUserStatus(
  id: string,
  dto: ToggleUserStatusDto
): Promise<UserStatusResult> {
  logger.info('Admin toggling user status', { userId: id, status: dto.status });

  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid user ID', HttpStatus.BAD_REQUEST);
  }

 
  let user = await this.tenantRepo.findById(id);
  
  if (user && user.role === 'TENANT') {

    const updatedUser = await this.tenantRepo.updateUserById(id, {
      isActive: dto.status === 'active',
    });

    if (!updatedUser) {
      throw new AppError('Failed to update tenant', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    logger.info('Tenant status toggled', { id, status: dto.status });
    return {
      id: updatedUser._id.toString(),
      userId: generateUserId(updatedUser._id.toString()),
      fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
      status: updatedUser.isActive ? 'active' : 'blocked',
    };
  }

 
  user = await this.landlordRepo.findById(id);
  
  if (user && user.role === 'LANDLORD') {
   
    const updatedUser = await this.landlordRepo.updateLandlordById(id, {
      isActive: dto.status === 'active',
    });

    if (!updatedUser) {
      throw new AppError('Failed to update landlord', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    logger.info('Landlord status toggled', { id, status: dto.status });
    return {
      id: updatedUser._id.toString(),
      userId: generateUserId(updatedUser._id.toString()),
      fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
      status: updatedUser.isActive ? 'active' : 'blocked',
    };
  }

 
  throw new AppError('User not found', HttpStatus.NOT_FOUND);
}

}
