import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import { GetAllPropertiesDto } from "../../dto/landlord/landlord.property.dto";
import { AuthRequest } from "../../middleware/auth.middleware";
import { ITenantPropertyService } from "../../services/interface/tenant/ITenantPropertyService";
import logger from "../../utils/logger";

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
      ApiResponses.success(
        {
          properties: result.properties,
          total: result.total,
          page: result.pageNum,
          limit: result.limitNum,
        },
        MESSAGES.PROPERTY.FETCH_ALL_SUCCESS,
      ),
    );
  }

  async getPropertyById(req: Request, res: Response): Promise<Response> {
    logger.info("Tenant fetch single property request");

    const { propertyId } = req.params;

    if (!propertyId) {
      logger.warn("Invalid propertyId provided");
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.PROPERTY.INVALID_ID));
    }

    const result =
      await this._tenantPropertyService.getPropertyById(propertyId);

    logger.info("Single property fetched SUCCESS", { propertyId });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(result, MESSAGES.PROPERTY.FETCH_ALL_SUCCESS));
  }

  async getPropertyPayments(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    const tenantId = req.user?.userId;

    if (!tenantId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PROPERTY.UNAUTHORIZED));
    }

    const { propertyId } = req.params;
    if (!propertyId) {
      logger.warn("Invalid propertyId provided");
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.PROPERTY.INVALID_ID));
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;

    const result = await this._tenantPropertyService.getPropertyPayments({
      propertyId,
      tenantId,
      page,
      limit,
      ...(type && { type }),
      ...(status && { status }),
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(result, MESSAGES.PAYMENT.FETCH_ALL));
  }
}
