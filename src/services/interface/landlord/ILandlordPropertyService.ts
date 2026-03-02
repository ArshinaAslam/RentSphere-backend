import type {
  AddPropertyDto,
  EditPropertyDto,
  GetPropertiesResultDto,
  GetPropertyResultDto,
  PropertyResultDto,
} from "../../../dto/landlord/landlord.property.dto";
import type { IProperty } from "../../../models/propertyModel";

export interface PropertyResult {
  propertyId: string;
  property: IProperty;
}

export interface GetPropertiesResult {
  properties: IProperty[];
  total: number;
  page: number;
  limit: number;
}

export interface GetPropertyResult {
  property: IProperty;
}
export interface ILandlordPropertyService {
  addProperty(
    dto: AddPropertyDto,
    imageFiles: Express.Multer.File[],
  ): Promise<PropertyResultDto>;
  getLandlordProperties(
    landlordId: string,
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<GetPropertiesResultDto>;
  getPropertyById(
    propertyId: string,
    landlordId: string,
  ): Promise<GetPropertyResultDto>;
  deletePropertyById(propertyId: string, landlordId: string): Promise<void>;
  editLandlordProperty(
    dto: EditPropertyDto,
    propertyId: string,
    landlordId: string,
    imageFiles: Express.Multer.File[],
  ): Promise<PropertyResultDto>;
}
