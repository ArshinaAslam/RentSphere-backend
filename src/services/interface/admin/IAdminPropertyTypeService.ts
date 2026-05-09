import type {
  AddPropertyTypeDto,
  GetPropertyTypesQuery,
  PaginatedPropertyTypesDto,
  PropertyTypeResultDto,
} from "../../../dto/admin/admin.property-type.dto";

export interface IAdminPropertyTypeService {
  getPropertyTypes(
    query: GetPropertyTypesQuery,
  ): Promise<PaginatedPropertyTypesDto>;
  addPropertyType(dto: AddPropertyTypeDto): Promise<PropertyTypeResultDto>;
  togglePropertyType(propertyTypeId: string): Promise<PropertyTypeResultDto>;
  deletePropertyType(propertyTypeId: string): Promise<void>;
}
