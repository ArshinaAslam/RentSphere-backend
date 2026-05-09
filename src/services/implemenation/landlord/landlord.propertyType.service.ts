import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { PropertyTypeMapper } from "../../../mappers/propertyType.mapper";
import { IPropertyTypeRepository } from "../../../repositories/interface/IPropertyTypeRepository";
import logger from "../../../utils/logger";
import { ILandlordPropertyTypeService } from "../../interface/landlord/ILandlordPropertyTypeService";

import type { ActivePropertyTypesDto } from "../../../dto/landlord/landlord.property-type.dto";

@injectable()
export default class LandlordPropertyTypeService implements ILandlordPropertyTypeService {
  constructor(
    @inject(DI_TYPES.PropertyTypeRepository)
    private readonly _propertyTypeRepo: IPropertyTypeRepository,
  ) {}

  async getActivePropertyTypes(): Promise<ActivePropertyTypesDto[]> {
    logger.info("Fetching active property types for landlord");

    const types = await this._propertyTypeRepo.findActive();

    logger.info(`Fetched ${types.length} active property types`);

    return PropertyTypeMapper.toDtoList(types);
  }
}
