export interface LandlordSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface PropertyResponseDto {
  _id: string;
  title: string;
  type: string;
  bhk: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  price: number;
  securityDeposit: number;
  vacant: number;
  status: "Available" | "Rented" | "Inactive";
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnishing: string;
  description: string;
  amenities: string[];
  images: string[];
  landlordId: string | LandlordSummaryDto;
  coordinates?:
    | {
        lat: number;
        lng: number;
      }
    | undefined;
}

export interface GetAllPropertiesResultDto {
  properties: PropertyResponseDto[];
  total: number;
  pageNum: number;
  limitNum: number;
}

export interface PropertyDetailDto {
  property: PropertyResponseDto;
}
