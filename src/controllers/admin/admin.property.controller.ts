import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import { GetAdminPropertiesDto } from "../../dto/admin/admin.property.dto";
import { IAdminPropertyService } from "../../services/interface/admin/IAdminPropertyService";

@injectable()
export class AdminPropertyController {
  constructor(
    @inject(DI_TYPES.AdminPropertyService)
    private readonly _propertyService: IAdminPropertyService,
  ) {}

  async getProperties(req: Request, res: Response): Promise<Response> {
    const data = await this._propertyService.getProperties(
      req.query as unknown as GetAdminPropertiesDto,
    );

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(data, MESSAGES.PROPERTY.FETCH_ALL_SUCCESS));
  }
}
