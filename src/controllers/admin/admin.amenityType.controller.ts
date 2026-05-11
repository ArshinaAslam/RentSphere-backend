import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import { IAdminAmenityService } from "../../services/interface/admin/IAdminAmenityService";
import logger from "../../utils/logger";

import type { AddAmenityDto } from "../../dto/admin/admin.amenity-type.dto";

@injectable()
export class AdminAmenityTypeController {
  constructor(
    @inject(DI_TYPES.AdminAmenityService)
    private readonly _amenityService: IAdminAmenityService,
  ) {}

  async getAmenities(req: Request, res: Response): Promise<Response> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = req.query.search as string | undefined;

    const data = await this._amenityService.getAmenities({
      page,
      limit,
      ...(search && { search }),
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(data, MESSAGES.AMENITY.FETCH_SUCCESS));
  }

  async addAmenity(req: Request, res: Response): Promise<Response> {
    const dto = req.body as AddAmenityDto;

    logger.info("Admin add amenity request", { label: dto.label });

    const data = await this._amenityService.addAmenity(dto);

    logger.info("Amenity created", {
      amenityId: data._id,
      label: data.label,
    });

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponses.success(data, MESSAGES.AMENITY.CREATED));
  }

  async toggleAmenity(req: Request, res: Response): Promise<Response> {
    const { amenityId } = req.params;

    if (!amenityId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.AMENITY.ID_REQUIRED));
    }

    logger.info("Admin toggle amenity request", { amenityId });

    const data = await this._amenityService.toggleAmenity(amenityId);

    logger.info("Amenity toggled", {
      amenityId,
      isActive: data.isActive,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(data, MESSAGES.AMENITY.UPDATED));
  }

  async deleteAmenity(req: Request, res: Response): Promise<Response> {
    const { amenityId } = req.params;

    if (!amenityId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.AMENITY.ID_REQUIRED));
    }

    logger.info("Admin delete amenity request", { amenityId });

    await this._amenityService.deleteAmenity(amenityId);

    logger.info("Amenity deleted", { amenityId });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(null, MESSAGES.AMENITY.DELETED));
  }
}
