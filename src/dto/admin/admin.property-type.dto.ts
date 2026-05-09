export interface AddPropertyTypeDto {
  name: string;
}

export interface PropertyTypeResultDto {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

export interface GetPropertyTypesQuery {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedPropertyTypesDto {
  data: PropertyTypeResultDto[];
  total: number;
  page: number;
  limit: number;
}
