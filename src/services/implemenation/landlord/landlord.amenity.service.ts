import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { AmenityMapper } from "../../../mappers/amenity.mapper";
import { IAmenityRepository } from "../../../repositories/interface/IAmenityRepository";
import logger from "../../../utils/logger";
import { ILandlordAmenityService } from "../../interface/landlord/ILandlordAmenityService";

import type { ActiveAmenityDto } from "../../../dto/landlord/landlord.amenity.dto";

@injectable()
export default class LandlordAmenityService implements ILandlordAmenityService {
  constructor(
    @inject(DI_TYPES.AmenityRepository)
    private readonly _amenityRepo: IAmenityRepository,
  ) {}

  async getActiveAmenities(): Promise<ActiveAmenityDto[]> {
    logger.info("Fetching active amenities for landlord");

    const amenities = await this._amenityRepo.findActive();

    logger.info(`Fetched ${amenities.length} active amenities`);

    return AmenityMapper.toDtoList(amenities);
  }
}
