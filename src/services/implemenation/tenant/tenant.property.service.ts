import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { GetAllPropertiesDto } from "../../../dto/landlord/landlord.property.dto";
import {
  GetAllPropertiesResultDto,
  PropertyDetailDto,
} from "../../../dto/tenant/tenant.property.dto";
import { PropertyMapper } from "../../../mappers/property.mapper";
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
  ) {}

  async getAllProperties(
    params: GetAllPropertiesDto,
  ): Promise<GetAllPropertiesResultDto> {
    const { page, limit, search, bhk, type, minPrice, maxPrice } = params;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 3;
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

  async getPropertyById(id: string): Promise<PropertyDetailDto> {
    logger.info("Fetching single property by ID", { propertyId: id });

    const property = await this._propertyRepo.findTenantPropertyById(id);

    if (!property) {
      logger.warn("Property not found", { propertyId: id });
      throw new Error("Property not found");
    }

    logger.info("Property fetched successfully", { propertyId: id });
    const mappedProperty = PropertyMapper.toResponseDto(property);

    return {
      property: mappedProperty,
    };
  }
}
