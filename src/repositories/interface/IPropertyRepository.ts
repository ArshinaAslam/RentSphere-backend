import type { IBaseRepository } from "../../common/repository/IBaseRepository";
import type { IProperty } from "../../models/propertyModel";

export interface IPropertyRepository extends IBaseRepository<IProperty> {
  createProperty(data: Partial<IProperty>): Promise<IProperty>;
  findByLandlordId(
    landlordId: string,
    skip: number,
    limit: number,
    search?: string,
  ): Promise<IProperty[]>;
  countByLandlordId(landlordId: string, search?: string): Promise<number>;
  findPropertyById(id: string): Promise<IProperty | null>;
  deletePropertyById(id: string): Promise<void>;
  updateProperty(
    id: string,
    updateData: Partial<IProperty>,
  ): Promise<IProperty | null>;

  findAllAvailable(params: {
    skip: number;
    limit: number;
    search?: string;
    bhk?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<IProperty[]>;

  countAllAvailable(params: {
    search?: string;
    bhk?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<number>;

  findTenantPropertyById(id: string): Promise<IProperty | null>;
  findAllPropertyByLandlordId(landlordId: string): Promise<IProperty[]>;
}
