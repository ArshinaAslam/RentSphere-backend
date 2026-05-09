import type {
  AddPropertyDto,
  EditPropertyDto,
  GetPropertiesResultDto,
  GetPropertyLeasesDto,
  GetPropertyPaymentsDto,
  GetPropertyResultDto,
  GetPropertyReviewsDto,
  PropertyResultDto,
} from "../../../dto/landlord/landlord.property.dto";
import type { ReviewResponseDto } from "../../../dto/tenant/tenant.review.dto";
import type { LeaseResponseDto } from "../../../mappers/lease.mapper";
import type { PaymentResponseDto } from "../../../mappers/payment.mapper";
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
  getPropertyLeases(dto: GetPropertyLeasesDto): Promise<{
    leases: LeaseResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;
  getPropertyPayments(dto: GetPropertyPaymentsDto): Promise<{
    payments: PaymentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;
  getPropertyReviews(dto: GetPropertyReviewsDto): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;
}
