import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";

import type { AuthRequest } from "../../middleware/auth.middleware";
import type { ILandlordPaymentService } from "../../services/interface/landlord/ILandlordPaymentService";

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
        .json(ApiResponses.error(MESSAGES.PAYMENT.UNAUTHORIZED));

    const result = await this._paymentService.getLandlordPayments(
      landlordId,
      req.query,
    );

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(result, MESSAGES.PAYMENT.FETCH_ALL));
  }

  async getPaymentById(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;

    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PAYMENT.UNAUTHORIZED));

    const { paymentId } = req.params;

    if (!paymentId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.PAYMENT.PAYMENT_ID_REQUIRED));

    const payment = await this._paymentService.getPaymentById(
      paymentId,
      landlordId,
    );

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success({ payment }, MESSAGES.PAYMENT.FETCH_ONE));
  }

  async getPaymentsByProperty(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    const landlordId = req.user?.userId;

    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PAYMENT.UNAUTHORIZED));

    const { propertyId } = req.params;

    if (!propertyId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.PAYMENT.PROPERTY_ID_REQUIRED));

    const payments = await this._paymentService.getPaymentsByProperty(
      landlordId,
      propertyId,
    );

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponses.success({ payments }, MESSAGES.PAYMENT.FETCH_PROPERTY),
      );
  }
}
