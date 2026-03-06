import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";
import { GetAllPropertiesDto } from "../../../dto/landlord/landlord.property.dto";
import { ITenantPropertyService } from "../../../services/interface/tenant/ITenantPropertyService";
import logger from "../../../utils/logger";

@injectable()
export class TenantPropertyController {
  constructor(
    @inject(DI_TYPES.TenantPropertyService)
    private readonly _tenantPropertyService: ITenantPropertyService,
  ) {}

  async getAllProperties(req: Request, res: Response): Promise<Response> {
    logger.info("Tenant fetch all properties request");

    const dto: GetAllPropertiesDto = req.query;

    const result = await this._tenantPropertyService.getAllProperties(dto);

    logger.info("All properties fetched SUCCESS", {
      count: result.properties.length,
    });

    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "Properties fetched successfully", {
        properties: result.properties,
        total: result.total,
        page: result.pageNum,
        limit: result.limitNum,
      }),
    );
  }

  async getPropertyById(req: Request, res: Response): Promise<Response> {
    logger.info("Tenant fetch single property request");

    const { propertyId } = req.params;

    if (!propertyId) {
      logger.warn("Invalid propertyId provided");
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Invalid property ID"));
    }

    const result =
      await this._tenantPropertyService.getPropertyById(propertyId);

    logger.info("Single property fetched SUCCESS", { propertyId: propertyId });

    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Property fetched successfully", result));
  }
}
