import type { IProperty } from "../../models/propertyModel";

export interface GetAdminPropertiesDto {
  page: number;
  limit: number;
  from?: string;
  to?: string;
}

export interface PaginatedAdminPropertiesDto {
  properties: IProperty[];
  total: number;
  page: number;
  totalPages: number;
}
