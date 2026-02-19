import { Request, Response } from "express";
import { DI_TYPES } from "../../../common/di/types";

import { injectable, inject } from "tsyringe";
import {  GetUsersDto, ToggleUserStatusDto } from "../../../dto/admin/admin.user.dto";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { MESSAGES } from "../../../common/constants/statusMessages";
import { ApiResponses } from "../../../common/response/ApiResponse";

import logger from "../../../utils/logger";
import { IAdminTenantService } from "../../../services/interface/admin/IAdminTenantService";
import { IAdminTenantController } from "../../interface/admin/IAdminTenantController";

@injectable()
export class AdminTenantController implements IAdminTenantController{
  constructor(
    @inject(DI_TYPES.AdminTenantService)
    private readonly _adminTenantService: IAdminTenantService,
  ) {}

 
  
  
  async getTenants(req: Request, res: Response): Promise<Response> {
    logger.info('Admin tenant list request', { query: req.query, ip: req.ip });

    const dto: GetUsersDto = {
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const data = await this._adminTenantService.getTenants(dto);  

    logger.info('Admin tenant list SUCCESS', { count: data.users.length, total: data.total });
    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, MESSAGES.USERS.FETCH_SUCCESS, data)
    );
  }







  async toggleTenantStatus(req: Request, res: Response): Promise<Response> {
    console.log("WQEghnj mvvzkjx")
    const tenantId = req.params.id;
     console.log("reached for toggle1",tenantId)
   if (!tenantId) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      new ApiResponses(false, "User ID is required", null)
    );
  }
    logger.info('Admin toggle user status request', { 
      userId: req.params.id,
      status: req.body.status,
      ip: req.ip 
    });
   
    const dto: ToggleUserStatusDto = {
      status: req.body.status,
    };

    const data = await this._adminTenantService.toggleTenantStatus(tenantId, dto);

    logger.info('User status toggle SUCCESS', { 
      userId: req.params.id,
      status: data.status 
    });
 console.log("data from toggleUserStatusc",data)
    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, MESSAGES.USERS.STATUS_UPDATE_SUCCESS, data)
    );
  }





}