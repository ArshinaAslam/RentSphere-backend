import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";
import { ILandlordPropertyController } from "../../../controllers/interface/landlord/ILandlordPropertyController";
import {
  AddPropertyDto,
  EditPropertyDto,
} from "../../../dto/landlord/landlord.property.dto";
import { AuthRequest } from "../../../middleware/auth.middleware";
import { ILandlordPropertyService } from "../../../services/interface/landlord/ILandlordPropertyService";
import logger from "../../../utils/logger";

@injectable()
export class LandlordPropertyController implements ILandlordPropertyController {
  constructor(
    @inject(DI_TYPES.LandlordPropertyService)
    private readonly _landlordPropertyService: ILandlordPropertyService,
  ) {}

  async AddLandlordProperty(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    const dto = req.body as AddPropertyDto;

    const imageFiles: Express.Multer.File[] = Array.isArray(req.files)
      ? req.files
      : (req.files?.images ?? []);

    logger.info("Property submission request", {
      landlordId: dto.landlordId,
    });

    const result = await this._landlordPropertyService.addProperty(
      dto,
      imageFiles,
    );

    logger.info("Property submitted SUCCESS", {
      propertyId: result.propertyId,
      landlordId: dto.landlordId,
    });

    return res.status(HttpStatus.CREATED).json(
      new ApiResponses(true, "Property listed successfully", {
        propertyId: result.property._id,
        property: result.property,
      }),
    );
  }

  async getLandlordProperties(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    logger.info("Fetch landlord properties");
    const landlordId = req.user?.userId;

    if (!landlordId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated"));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    const search = (req.query.search as string) || "";

    const result = await this._landlordPropertyService.getLandlordProperties(
      landlordId,
      page,
      limit,
      search,
    );

    logger.info("Properties fetched SUCCESS", {
      landlordId: req.user?.userId,
      count: result.properties.length,
    });

    return res.status(200).json(
      new ApiResponses(true, "Properties fetched successfully", {
        properties: result.properties,
        total: result.total,
        page: result.page,
        limit: result.limit,
      }),
    );
  }

  async getLandlordPropertyById(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    logger.info("Fetch single property");

    const propertyId = req.params.id;

    if (!propertyId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Property ID is required"));
    }
    const landlordId = req.user?.userId;
    if (!landlordId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Landlord not authenticated"));
    }

    const result = await this._landlordPropertyService.getPropertyById(
      propertyId,
      landlordId,
    );

    logger.info("Property fetched SUCCESS", { propertyId, landlordId });

    return res
      .status(200)
      .json(new ApiResponses(true, "Property fetched successfully", result));
  }

  async deleteLandlordProperty(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    logger.info("Delete property request", {
      propertyId: req.params.id,
      landlordId: req.user?.userId,
    });

    const propertyId = req.params.id;

    if (!propertyId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Property ID is required"));
    }
    const landlordId = req.user?.userId;
    if (!landlordId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Landlord not authenticated"));
    }

    await this._landlordPropertyService.deletePropertyById(
      propertyId,
      landlordId,
    );

    logger.info("Property deleted SUCCESS", { propertyId, landlordId });

    return res
      .status(200)
      .json(new ApiResponses(true, "Property deleted successfully"));
  }

  async editLandlordProperty(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    logger.info("Landlord property edit request", {
      propertyId: req.params.id,
      landlordId: req.user?.userId,
    });

    const propertyId = req.params.id;
    const landlordId = req.user?.userId;

    if (!landlordId || !propertyId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(
          new ApiResponses(false, "Property ID and authentication required"),
        );
    }

    const dto = req.body as EditPropertyDto;

    const imageFiles: Express.Multer.File[] = Array.isArray(req.files)
      ? req.files
      : req.files?.images || [];

    const result = await this._landlordPropertyService.editLandlordProperty(
      dto,
      propertyId,
      landlordId,
      imageFiles,
    );

    logger.info("Landlord property updated SUCCESS", {
      propertyId: result.propertyId,
      landlordId,
      imageCount: result.property.images.length,
    });

    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "Property updated successfully", {
        propertyId: result.propertyId,
        property: result.property,
      }),
    );
  }
}
