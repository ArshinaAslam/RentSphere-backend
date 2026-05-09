import type { ActiveAmenityDto } from "../../../dto/landlord/landlord.amenity.dto";

export interface ILandlordAmenityService {
  getActiveAmenities(): Promise<ActiveAmenityDto[]>;
}
