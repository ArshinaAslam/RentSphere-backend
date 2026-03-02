import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";
import {
  GetUsersDto,
  ToggleUserStatusDto,
} from "../../../dto/admin/admin.user.dto";
import { IAdminTenantService } from "../../../services/interface/admin/IAdminTenantService";
import logger from "../../../utils/logger";
import { IAdminTenantController } from "../../interface/admin/IAdminTenantController";

@injectable()
export class AdminTenantController implements IAdminTenantController {
  constructor(
    @inject(DI_TYPES.AdminTenantService)
    private readonly _adminTenantService: IAdminTenantService,
  ) {}

  async getTenants(req: Request, res: Response): Promise<Response> {
    logger.info("Admin tenant list request", { query: req.query, ip: req.ip });

    const dto: GetUsersDto = req.query;

    const data = await this._adminTenantService.getTenants(dto);

    logger.info("Admin tenant list SUCCESS", {
      count: data.users.length,
      total: data.total,
    });
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, MESSAGES.USERS.FETCH_SUCCESS, data));
  }

  async toggleTenantStatus(req: Request, res: Response): Promise<Response> {
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

    const data = await this._adminTenantService.toggleTenantStatus(
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
}
