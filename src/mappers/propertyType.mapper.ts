import type { PropertyTypeResultDto } from "../dto/admin/admin.property-type.dto";
import type { IPropertyType } from "../models/propertyTypeModel";

export class PropertyTypeMapper {
  static toDto(type: IPropertyType): PropertyTypeResultDto {
    return {
      _id: String(type._id),
      name: type.name,
      isActive: type.isActive,
      createdAt: type.createdAt,
    };
  }

  static toDtoList(types: IPropertyType[]): PropertyTypeResultDto[] {
    return types.map((t) => this.toDto(t));
  }
}
