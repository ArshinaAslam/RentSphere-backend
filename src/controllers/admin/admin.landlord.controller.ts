import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import {
  GetUsersDto,
  ToggleUserStatusDto,
} from "../../dto/admin/admin.user.dto";
import { IAdminLandlordService } from "../../services/interface/admin/IAdminLandlordService";
import logger from "../../utils/logger";

@injectable()
export class AdminLandlordController {
  constructor(
    @inject(DI_TYPES.AdminLandlordService)
    private readonly _adminLandlordService: IAdminLandlordService,
  ) {}

  async getLandlords(req: Request, res: Response): Promise<Response> {
    logger.info("Admin landlord list request", { query: req.query });

    const dto: GetUsersDto = req.query;

    const data = await this._adminLandlordService.getLandlords(dto);

    logger.info("Admin landlord list SUCCESS", {
      count: data.users.length,
      total: data.total,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(data, MESSAGES.USERS.FETCH_SUCCESS));
  }

  async getLandlordDetails(req: Request, res: Response): Promise<Response> {
    const landlordId = req.params.landlordId;

    if (!landlordId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.ADMIN.LANDLORD_ID_REQUIRED));
    }

    logger.info("Admin single landlord request", { landlordId });

    const landlord =
      await this._adminLandlordService.getLandlordDetails(landlordId);

    logger.info("Admin single landlord SUCCESS", {
      landlordId,
      fullName: landlord.fullName,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(landlord, MESSAGES.USERS.FETCH_SUCCESS));
  }

  async toggleLandlordStatus(req: Request, res: Response): Promise<Response> {
    const landlordId = req.params.landlordId;

    if (!landlordId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.ADMIN.USER_ID_REQUIRED));
    }

    const dto = req.body as ToggleUserStatusDto;

    logger.info("Admin toggle user status request", {
      userId: landlordId,
      status: dto.status,
    });

    const data = await this._adminLandlordService.toggleLandlordStatus(
      landlordId,
      dto,
    );

    logger.info("User status toggle SUCCESS", {
      userId: landlordId,
      status: data.status,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(data, MESSAGES.USERS.STATUS_UPDATE_SUCCESS));
  }

  async approveLandlordKyc(req: Request, res: Response): Promise<Response> {
    const landlordId = req.params.landlordId;

    if (!landlordId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.ADMIN.INVALID_LANDLORD_ID));
    }

    logger.info("Admin approving KYC", { landlordId: landlordId });

    const landlord =
      await this._adminLandlordService.approveLandlordKyc(landlordId);

    logger.info("KYC approved successfully", {
      landlordId: landlordId,
      fullName: landlord.fullName,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(landlord, "KYC approved successfully"));
  }

  async rejectLandlordKyc(req: Request, res: Response): Promise<Response> {
    const landlordId = req.params.landlordId;
    const { reason } = req.body as { reason: string };

    if (!landlordId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.ADMIN.INVALID_LANDLORD_ID));
    }

    logger.info("Admin rejecting KYC", { landlordId: landlordId });

    const landlord = await this._adminLandlordService.rejectLandlordKyc(
      landlordId,
      reason,
    );

    logger.info("KYC rejected successfully", { landlordId: landlordId });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(landlord, "KYC rejected successfully"));
  }
}
