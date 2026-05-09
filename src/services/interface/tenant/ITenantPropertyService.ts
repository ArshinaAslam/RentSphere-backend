import type { GetAllPropertiesDto } from "../../../dto/landlord/landlord.property.dto";
import type {
  GetTenantPropertyPaymentsDto,
  TenantPaymentsResultDto,
} from "../../../dto/tenant/tenant.payment.dto";
import type {
  GetAllPropertiesResultDto,
  PropertyDetailDto,
} from "../../../dto/tenant/tenant.property.dto";

export interface PropertyQueryParams {
  search?: string;
  bhk?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ITenantPropertyService {
  getAllProperties(
    params: GetAllPropertiesDto,
  ): Promise<GetAllPropertiesResultDto>;
  getPropertyById(propertyId: string): Promise<PropertyDetailDto>;
  getPropertyPayments(
    dto: GetTenantPropertyPaymentsDto,
  ): Promise<TenantPaymentsResultDto>;
}
