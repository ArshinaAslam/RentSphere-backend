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
  landlordId?: string | object;
}

export interface AddPropertyDto {
  title: string;
  type: "Apartment" | "Villa" | "House";
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
  landlordId?: string;
}

export interface EditPropertyDto {
  title: string;
  type: "Apartment" | "Villa" | "House";
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
  existingImages?: string | string[];
}

export interface GetAllPropertiesDto {
  page?: string;
  limit?: string;
  search?: string;
  bhk?: string;
  type?: "Apartment" | "Villa" | "House";
  minPrice?: string;
  maxPrice?: string;
}

export interface PropertyResultDto {
  propertyId: string;
  property: PropertyResponseDto;
}

export interface GetPropertiesResultDto {
  properties: PropertyResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface GetPropertyResultDto {
  property: PropertyResponseDto;
}
