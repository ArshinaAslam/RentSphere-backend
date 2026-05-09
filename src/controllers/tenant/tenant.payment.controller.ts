import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";

import type {
  CreateDepositOrderDto,
  GetPaymentsQueryDto,
  VerifyPaymentDto,
} from "../../dto/tenant/tenant.payment.dto";
import type { AuthRequest } from "../../middleware/auth.middleware";
import type { ITenantPaymentService } from "../../services/interface/tenant/IPaymentService";

@injectable()
export class TenantPaymentController {
  constructor(
    @inject(DI_TYPES.TenantPaymentService)
    private readonly _paymentService: ITenantPaymentService,
  ) {}

  async createDepositOrder(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;

    if (!tenantId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PAYMENT.UNAUTHORIZED));

    const dto = req.body as CreateDepositOrderDto;

    const result = await this._paymentService.createDepositOrder(dto, tenantId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(result, MESSAGES.PAYMENT.ORDER_CREATED));
  }

  async verifyPayment(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;

    if (!tenantId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PAYMENT.UNAUTHORIZED));

    const dto = req.body as VerifyPaymentDto;

    const payment = await this._paymentService.verifyAndCompletePayment(
      dto,
      tenantId,
    );

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success({ payment }, MESSAGES.PAYMENT.VERIFY_SUCCESS));
  }

  async getTenantPayments(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;

    if (!tenantId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PAYMENT.UNAUTHORIZED));

    const result = await this._paymentService.getTenantPayments(
      tenantId,
      req.query as GetPaymentsQueryDto,
    );

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(result, MESSAGES.PAYMENT.FETCH_ALL));
  }

  async getLeasePayments(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;

    if (!tenantId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PAYMENT.UNAUTHORIZED));

    const { leaseId } = req.params;

    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.PAYMENT.LEASE_ID_REQUIRED));

    const payments = await this._paymentService.getLeasePayments(
      leaseId,
      tenantId,
    );

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success({ payments }, MESSAGES.PAYMENT.FETCH_LEASE));
  }

  async createRentOrder(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;

    if (!tenantId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.PAYMENT.UNAUTHORIZED));

    const { leaseId, month, year } = req.body as {
      leaseId: string;
      month: number;
      year: number;
    };

    const result = await this._paymentService.createRentOrder(
      { leaseId, month, year },
      tenantId,
    );

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(result, MESSAGES.PAYMENT.RENT_ORDER_CREATED));
  }
}
