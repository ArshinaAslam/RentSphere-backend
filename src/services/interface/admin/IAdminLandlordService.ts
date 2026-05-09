import type {
  LandlordDetailsDto,
  LandlordListDto,
} from "../../../dto/admin/admin.landlord.dto";
import type {
  GetUsersDto,
  ToggleUserStatusDto,
} from "../../../dto/admin/admin.user.dto";

export interface LandlordStatusResult {
  id: string;
  userId: string;
  fullName: string;
  status: "active" | "blocked";
}
export interface IAdminLandlordService {
  getLandlords(dto: GetUsersDto): Promise<LandlordListDto>;
  getLandlordDetails(id: string): Promise<LandlordDetailsDto>;
  toggleLandlordStatus(
    id: string,
    dto: ToggleUserStatusDto,
  ): Promise<LandlordStatusResult>;
  approveLandlordKyc(landlordId: string): Promise<LandlordDetailsDto>;
  rejectLandlordKyc(
    landlordId: string,
    reason: string,
  ): Promise<LandlordDetailsDto>;
}
