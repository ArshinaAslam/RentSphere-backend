import type {
  GetAdminPropertiesDto,
  PaginatedAdminPropertiesDto,
} from "../../../dto/admin/admin.property.dto";

export interface IAdminPropertyService {
  getProperties(
    query: GetAdminPropertiesDto,
  ): Promise<PaginatedAdminPropertiesDto>;
}
