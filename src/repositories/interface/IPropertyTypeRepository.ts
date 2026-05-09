import type { IPropertyType } from "../../models/propertyTypeModel";
import type { FilterQuery } from "mongoose";

export interface IPropertyTypeRepository {
  findAll(filter?: FilterQuery<IPropertyType>): Promise<IPropertyType[]>;
  findById(propertyTypeId: string): Promise<IPropertyType | null>;
  findByName(name: string): Promise<IPropertyType | null>;
  createPropertyType(data: Partial<IPropertyType>): Promise<IPropertyType>;
  updateById(
    propertyTypeId: string,
    data: Partial<IPropertyType>,
  ): Promise<IPropertyType | null>;
  deleteById(propertyTypeId: string): Promise<void>;
  findPaginated(
    skip: number,
    limit: number,
    search: string,
  ): Promise<IPropertyType[]>;
  countByFilter(search: string): Promise<number>;
  findActive(): Promise<IPropertyType[]>;
}
