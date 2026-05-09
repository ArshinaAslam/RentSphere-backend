import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import { IAdminPropertyTypeService } from "../../services/interface/admin/IAdminPropertyTypeService";
import logger from "../../utils/logger";

import type { AddPropertyTypeDto } from "../../dto/admin/admin.property-type.dto";

@injectable()
export class AdminPropertyTypeController {
  constructor(
    @inject(DI_TYPES.AdminPropertyTypeService)
    private readonly _propertyTypeService: IAdminPropertyTypeService,
  ) {}

  async getPropertyTypes(req: Request, res: Response): Promise<Response> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 1;
    const search = req.query.search as string | undefined;

    const data = await this._propertyTypeService.getPropertyTypes({
      page,
      limit,
      ...(search && { search }),
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(data, MESSAGES.PROPERTY_TYPE.FETCH_SUCCESS));
  }

  async addPropertyType(req: Request, res: Response): Promise<Response> {
    const dto = req.body as AddPropertyTypeDto;

    logger.info("Admin add property type request", {
      name: dto.name,
    });

    const data = await this._propertyTypeService.addPropertyType(dto);

    logger.info("Property type created", {
      id: data._id,
      name: data.name,
    });

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponses.success(data, MESSAGES.PROPERTY_TYPE.CREATED));
  }

  async togglePropertyType(req: Request, res: Response): Promise<Response> {
    const { propertyTypeId } = req.params;

    if (!propertyTypeId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.PROPERTY_TYPE.ID_REQUIRED));
    }

    logger.info("Admin toggle property type request", { propertyTypeId });

    const data =
      await this._propertyTypeService.togglePropertyType(propertyTypeId);

    logger.info("Property type toggled", {
      propertyTypeId,
      isActive: data.isActive,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(data, MESSAGES.PROPERTY_TYPE.UPDATED));
  }

  async deletePropertyType(req: Request, res: Response): Promise<Response> {
    const { propertyTypeId } = req.params;

    if (!propertyTypeId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.PROPERTY_TYPE.ID_REQUIRED));
    }

    logger.info("Admin delete property type request", { propertyTypeId });

    await this._propertyTypeService.deletePropertyType(propertyTypeId);

    logger.info("Property type deleted", { propertyTypeId });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(null, MESSAGES.PROPERTY_TYPE.DELETED));
  }
}
