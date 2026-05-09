import type { AmenityResultDto } from "../dto/admin/admin.amenity-type.dto";
import type { IAmenity } from "../models/amenityModel";

export class AmenityMapper {
  static toDto(amenity: IAmenity): AmenityResultDto {
    return {
      _id: String(amenity._id),
      label: amenity.label,
      emoji: amenity.emoji,
      isActive: amenity.isActive,
      createdAt: amenity.createdAt,
    };
  }

  static toDtoList(amenities: IAmenity[]): AmenityResultDto[] {
    return amenities.map((a) => this.toDto(a));
  }
}
