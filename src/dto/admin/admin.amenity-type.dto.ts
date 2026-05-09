export interface AddAmenityDto {
  label: string;
  emoji: string;
}

export interface AmenityResultDto {
  _id: string;
  label: string;
  emoji: string;
  isActive: boolean;
  createdAt: Date;
}

export interface GetAmenitiesQuery {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedAmenitiesDto {
  data: AmenityResultDto[];
  total: number;
  page: number;
  limit: number;
}
