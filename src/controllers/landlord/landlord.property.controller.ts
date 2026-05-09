import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import {
  AddPropertyDto,
  EditPropertyDto,
} from "../../dto/landlord/landlord.property.dto";
import { AuthRequest } from "../../middleware/auth.middleware";
import { ILandlordPropertyService } from "../../services/interface/landlord/ILandlordPropertyService";
import logger from "../../utils/logger";

@injectable()
export class LandlordPropertyController {
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
      ApiResponses.success(
        {
          propertyId: result.property._id,
          property: result.property,
        },
        "Property listed successfully",
      ),
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
        .json(ApiResponses.error(MESSAGES.PROPERTY.UNAUTHORIZED));
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
      ApiResponses.success(
        {
          properties: result.properties,
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
        MESSAGES.PROPERTY.FETCH_ALL_SUCCESS,
      ),
    );
  }

  async getLandlordPropertyById(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    logger.info("Fetch single property");

    const propertyId = req.params.propertyId;

    if (!propertyId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.PROPERTY.INVALID_ID));
    }

    const landlordId = req.user?.userId;
    if (!landlordId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PROPERTY.LANDLORD_UNAUTHORIZED));
    }

    const result = await this._landlordPropertyService.getPropertyById(
      propertyId,
      landlordId,
    );

    logger.info("Property fetched SUCCESS", { propertyId, landlordId });

    return res
      .status(200)
      .json(ApiResponses.success(result, MESSAGES.PROPERTY.FETCH_ONE_SUCCESS));
  }

  async deleteLandlordProperty(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    logger.info("Delete property request", {
      propertyId: req.params.propertyId,
      landlordId: req.user?.userId,
    });

    const propertyId = req.params.propertyId;

    if (!propertyId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.PROPERTY.INVALID_ID));
    }

    const landlordId = req.user?.userId;
    if (!landlordId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PROPERTY.LANDLORD_UNAUTHORIZED));
    }

    await this._landlordPropertyService.deletePropertyById(
      propertyId,
      landlordId,
    );

    logger.info("Property deleted SUCCESS", { propertyId, landlordId });

    return res
      .status(200)
      .json(ApiResponses.success(null, MESSAGES.PROPERTY.DELETE_SUCCESS));
  }

  async editLandlordProperty(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    logger.info("Landlord property edit request", {
      propertyId: req.params.propertyId,
      landlordId: req.user?.userId,
    });

    const propertyId = req.params.propertyId;
    const landlordId = req.user?.userId;

    if (!landlordId || !propertyId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PROPERTY.EDIT_INVALID));
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
      ApiResponses.success(
        {
          propertyId: result.propertyId,
          property: result.property,
        },
        MESSAGES.PROPERTY.UPDATE_SUCCESS,
      ),
    );
  }

  async getPropertyLeases(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PROPERTY.LANDLORD_UNAUTHORIZED));
    }

    const { propertyId } = req.params;
    if (!propertyId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.PROPERTY.INVALID_ID));
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const status = req.query.status as string | undefined;

    const result = await this._landlordPropertyService.getPropertyLeases({
      propertyId,
      landlordId,
      page,
      limit,
      ...(status && { status }),
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(result, MESSAGES.LEASE.FETCH_ALL_SUCCESS));
  }

  async getPropertyPayments(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    const landlordId = req.user?.userId;

    if (!landlordId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PROPERTY.LANDLORD_UNAUTHORIZED));
    }

    const { propertyId } = req.params;

    if (!propertyId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.PROPERTY.INVALID_ID));
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 2;
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;

    const result = await this._landlordPropertyService.getPropertyPayments({
      propertyId,
      landlordId,
      page,
      limit,
      ...(type && { type }),
      ...(status && { status }),
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(result, MESSAGES.PAYMENT.FETCH_ALL));
  }

  async getPropertyReviews(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PROPERTY.LANDLORD_UNAUTHORIZED));

    const { propertyId } = req.params;
    if (!propertyId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.PROPERTY.INVALID_ID));

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const result = await this._landlordPropertyService.getPropertyReviews({
      propertyId,
      landlordId,
      page,
      limit,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(result, MESSAGES.REVIEW.FETCHED));
  }
}
