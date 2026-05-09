// controllers/landlord/landlord.propertyType.controller.ts
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import { ILandlordPropertyTypeService } from "../../services/interface/landlord/ILandlordPropertyTypeService";
import logger from "../../utils/logger";

@injectable()
export class LandlordPropertyTypeController {
  constructor(
    @inject(DI_TYPES.LandlordPropertyTypeService)
    private readonly _propertyTypeService: ILandlordPropertyTypeService,
  ) {}

  async getActivePropertyTypes(req: Request, res: Response): Promise<Response> {
    logger.info("Landlord fetch active property types request");

    const data = await this._propertyTypeService.getActivePropertyTypes();

    logger.info("Landlord fetch active property types SUCCESS", {
      count: data.length,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(data, MESSAGES.PROPERTY_TYPE.FETCH_SUCCESS));
  }
}
