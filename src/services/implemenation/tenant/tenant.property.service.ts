import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { GetAllPropertiesDto } from "../../../dto/landlord/landlord.property.dto";
import {
  GetTenantPropertyPaymentsDto,
  TenantPaymentsResultDto,
} from "../../../dto/tenant/tenant.payment.dto";
import {
  GetAllPropertiesResultDto,
  PropertyDetailDto,
} from "../../../dto/tenant/tenant.property.dto";
import { PaymentMapper } from "../../../mappers/payment.mapper";
import { PropertyMapper } from "../../../mappers/property.mapper";
import { IPaymentRepository } from "../../../repositories/interface/IPaymentRepository";
import { IPropertyRepository } from "../../../repositories/interface/IPropertyRepository";
import logger from "../../../utils/logger";
import {
  ITenantPropertyService,
  PropertyQueryParams,
} from "../../interface/tenant/ITenantPropertyService";

@injectable()
export class TenantPropertyService implements ITenantPropertyService {
  constructor(
    @inject(DI_TYPES.PropertyRepository)
    private readonly _propertyRepo: IPropertyRepository,
    @inject(DI_TYPES.PaymentRepository)
    private readonly _paymentRepo: IPaymentRepository,
  ) {}

  async getAllProperties(
    params: GetAllPropertiesDto,
  ): Promise<GetAllPropertiesResultDto> {
    const { page, limit, search, bhk, type, minPrice, maxPrice } = params;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 6;
    const skip = (pageNum - 1) * limitNum;

    const queryParams: PropertyQueryParams = {};
    if (search) queryParams.search = search;
    if (bhk) queryParams.bhk = bhk;
    if (type) queryParams.type = type;
    if (minPrice !== undefined) queryParams.minPrice = Number(minPrice);
    if (maxPrice !== undefined) queryParams.maxPrice = Number(maxPrice);

    const [properties, total] = await Promise.all([
      this._propertyRepo.findAllAvailable({
        skip,
        limit: limitNum,
        ...queryParams,
      }),
      this._propertyRepo.countAllAvailable(queryParams),
    ]);

    logger.info("All available properties fetched", { page, limit, total });

    const mappedProperties = PropertyMapper.toResponseDtoList(properties);
    return {
      properties: mappedProperties,
      total,
      pageNum,
      limitNum,
    };
  }

  async getPropertyById(propertyId: string): Promise<PropertyDetailDto> {
    logger.info("Fetching single property by ID", { propertyId: propertyId });

    const property =
      await this._propertyRepo.findTenantPropertyById(propertyId);

    if (!property) {
      logger.warn("Property not found", { propertyId: propertyId });
      throw new Error(MESSAGES.PROPERTY.PROPERTY_NOT_FOUND);
    }

    logger.info("Property fetched successfully", { propertyId: propertyId });
    const mappedProperty = PropertyMapper.toResponseDto(property);

    return {
      property: mappedProperty,
    };
  }

  async getPropertyPayments(
    dto: GetTenantPropertyPaymentsDto,
  ): Promise<TenantPaymentsResultDto> {
    const { data, total } = await this._paymentRepo.findByPropertyAndTenant(
      dto.propertyId,
      dto.tenantId,
      dto.page,
      dto.limit,
      dto.type,
      dto.status,
    );
    return {
      payments: PaymentMapper.toDtoList(data),
      total,
      page: dto.page,
      limit: dto.limit,
    };
  }
}
