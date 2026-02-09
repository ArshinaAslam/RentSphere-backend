import { GetUsersDto, LandlordDetailsDto, ToggleUserStatusDto } from '../../dto/users.dto';

export interface UsersListResult {
  users: Array<{
    id: string;
    tenantId: string;
    fullName: string;
    email: string;
    phone: string;
    status: 'active' | 'blocked';
    kycStatus: string;
    // joinedAt: string;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export interface UserStatusResult {
  id: string;
  userId: string;
  fullName: string;
  status: 'active' | 'blocked';
}
export interface IUserService {
  getTenants(dto: GetUsersDto): Promise<UsersListResult>;
  getLandlords(dto: GetUsersDto): Promise<UsersListResult>;
 getLandlordDetails(id: string): Promise<LandlordDetailsDto>
  toggleUserStatus(id: string, dto: ToggleUserStatusDto): Promise<UserStatusResult>;
  approveLandlordKyc(landlordId: string): Promise<LandlordDetailsDto>
  rejectLandlordKyc(landlordId: string, reason: string): Promise<LandlordDetailsDto>
}
