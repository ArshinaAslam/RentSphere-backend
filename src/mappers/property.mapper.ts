import type { PropertyResponseDto } from "../dto/tenant/tenant.property.dto";
import type { ILandlord } from "../models/landlordModel";
import type { IProperty } from "../models/propertyModel";

export class PropertyMapper {
  static toResponseDto(property: IProperty): PropertyResponseDto {
    const landlordId = property.landlordId;
    const isPopulated =
      typeof landlordId === "object" &&
      landlordId !== null &&
      "firstName" in (landlordId as object);

    const mappedLandlord = isPopulated
      ? {
          id: String((landlordId as ILandlord)._id),
          firstName: (landlordId as ILandlord).firstName,
          lastName: (landlordId as ILandlord).lastName ?? "",
          email: (landlordId as ILandlord).email,
          phone: (landlordId as ILandlord).phone ?? "",
          avatar: (landlordId as ILandlord).avatar ?? "",
        }
      : String(landlordId);

    return {
      _id: String(property._id),
      title: property.title,
      type: property.type,
      bhk: property.bhk,
      address: property.address,
      city: property.city,
      state: property.state,
      pincode: property.pincode,
      price: property.price,
      securityDeposit: property.securityDeposit,
      vacant: property.vacant,
      status: property.status,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      furnishing: property.furnishing,
      description: property.description,
      amenities: property.amenities,
      images: property.images,
      landlordId: mappedLandlord,
      coordinates: property.coordinates ?? undefined,
    };
  }

  static toResponseDtoList(properties: IProperty[]): PropertyResponseDto[] {
    return properties.map((p) => PropertyMapper.toResponseDto(p));
  }
}
