import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { ApiResponses } from "../../../common/response/ApiResponse";
import {
  GetUsersDto,
  ToggleUserStatusDto,
} from "../../../dto/admin/admin.user.dto";
import { IAdminLandlordService } from "../../../services/interface/admin/IAdminLandlordService";
import logger from "../../../utils/logger";
import { IAdminLandlordController } from "../../interface/admin/IAdminLandlordController";

@injectable()
export class AdminLandlordController implements IAdminLandlordController {
  constructor(
    @inject(DI_TYPES.AdminLandlordService)
    private readonly _adminLandlordService: IAdminLandlordService,
  ) {}

  async getLandlords(req: Request, res: Response): Promise<Response> {
    logger.info("Admin landlord list request", {
      query: req.query,
    });

    const dto: GetUsersDto = req.query;

    const data = await this._adminLandlordService.getLandlords(dto);

    logger.info("Admin landlord list SUCCESS", {
      count: data.users.length,
      total: data.total,
    });
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, MESSAGES.USERS.FETCH_SUCCESS, data));
  }

  async getLandlordDetails(req: Request, res: Response): Promise<Response> {
    logger.info("Admin single landlord request", {
      id: req.params.id,
    });

    const id = req.params.id;
    if (!id) {
      throw new AppError("Landlord id is required", HttpStatus.BAD_REQUEST);
    }

    const landlord = await this._adminLandlordService.getLandlordDetails(id);

    logger.info("Admin single landlord SUCCESS", {
      id: id,
      fullName: landlord.fullName,
    });

    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, MESSAGES.USERS.FETCH_SUCCESS, landlord));
  }

  async toggleLandlordStatus(req: Request, res: Response): Promise<Response> {
    const tenantId = req.params.id;

    if (!tenantId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "User ID is required", null));
    }

    const dto = req.body as ToggleUserStatusDto;

    logger.info("Admin toggle user status request", {
      userId: req.params.id,
      status: dto.status,
    });
    const data = await this._adminLandlordService.toggleLandlordStatus(
      tenantId,
      dto,
    );

    logger.info("User status toggle SUCCESS", {
      userId: req.params.id,
      status: data.status,
    });

    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, MESSAGES.USERS.STATUS_UPDATE_SUCCESS, data));
  }

  async approveLandlordKyc(req: Request, res: Response): Promise<void> {
    if (typeof req.params.id !== "string") {
      throw new AppError("Invalid landlord ID", HttpStatus.BAD_REQUEST);
    }
    const { id } = req.params;

    logger.info("Admin approving KYC", { landlordId: id });

    const landlord = await this._adminLandlordService.approveLandlordKyc(id);

    logger.info("KYC approved successfully", {
      landlordId: id,
      fullName: landlord.fullName,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: "KYC approved successfully",
      data: landlord,
    });
  }

  async rejectLandlordKyc(req: Request, res: Response): Promise<void> {
    if (typeof req.params.id !== "string") {
      throw new AppError("Invalid landlord ID", HttpStatus.BAD_REQUEST);
    }
    const { id } = req.params;
    const { reason } = req.body as { reason: string };

    logger.info("Admin rejecting KYC", { landlordId: id });

    const landlord = await this._adminLandlordService.rejectLandlordKyc(
      id,
      reason,
    );

    logger.info("KYC rejected successfully", { landlordId: id });
    res.status(HttpStatus.OK).json({
      success: true,
      message: "KYC rejected successfully",
      data: landlord,
    });
  }
}
