import type {
  AddAmenityDto,
  AmenityResultDto,
  GetAmenitiesQuery,
  PaginatedAmenitiesDto,
} from "../../../dto/admin/admin.amenity-type.dto";

export interface IAdminAmenityService {
  getAmenities(query: GetAmenitiesQuery): Promise<PaginatedAmenitiesDto>;
  addAmenity(dto: AddAmenityDto): Promise<AmenityResultDto>;
  toggleAmenity(id: string): Promise<AmenityResultDto>;
  deleteAmenity(id: string): Promise<void>;
}
