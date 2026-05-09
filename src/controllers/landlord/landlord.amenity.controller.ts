import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import { ILandlordAmenityService } from "../../services/interface/landlord/ILandlordAmenityService";
import logger from "../../utils/logger";

@injectable()
export class LandlordAmenityController {
  constructor(
    @inject(DI_TYPES.LandlordAmenityService)
    private readonly _amenityService: ILandlordAmenityService,
  ) {}

  async getActiveAmenities(req: Request, res: Response): Promise<Response> {
    logger.info("Landlord fetch active amenities request", { ip: req.ip });

    const data = await this._amenityService.getActiveAmenities();

    logger.info("Landlord fetch active amenities SUCCESS", {
      count: data.length,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(data, MESSAGES.AMENITY.FETCH_SUCCESS));
  }
}
