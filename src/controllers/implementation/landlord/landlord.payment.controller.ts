import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";

import type { AuthRequest } from "../../../middleware/auth.middleware";
import type { ILandlordPaymentService } from "../../../services/interface/landlord/ILandlordPaymentService";

@injectable()
export class LandlordPaymentController {
  constructor(
    @inject(DI_TYPES.LandlordPaymentService)
    private readonly _paymentService: ILandlordPaymentService,
  ) {}

  async getLandlordPayments(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

    const payments = await this._paymentService.getLandlordPayments(landlordId);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Payments fetched", { payments }));
  }

  async getPaymentsByProperty(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

    const { propertyId } = req.params;
    if (!propertyId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Property ID required"));

    const payments = await this._paymentService.getPaymentsByProperty(
      landlordId,
      propertyId,
    );
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Property payments fetched", { payments }));
  }
}
