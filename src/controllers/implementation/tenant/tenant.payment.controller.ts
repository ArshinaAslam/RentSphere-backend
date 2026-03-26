import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";

import type {
  CreateDepositOrderDto,
  GetPaymentsQueryDto,
  VerifyPaymentDto,
} from "../../../dto/tenant/tenant.payment.dto";
import type { AuthRequest } from "../../../middleware/auth.middleware";
import type { ITenantPaymentService } from "../../../services/interface/tenant/IPaymentService";

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
        .json(new ApiResponses(false, "Unauthorized"));

    const dto = req.body as CreateDepositOrderDto;
    const result = await this._paymentService.createDepositOrder(dto, tenantId);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Order created", result));
  }

  async verifyPayment(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;
    if (!tenantId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

    const dto = req.body as VerifyPaymentDto;
    const payment = await this._paymentService.verifyAndCompletePayment(
      dto,
      tenantId,
    );
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponses(true, "Payment verified successfully", { payment }),
      );
  }

  // async getTenantPayments(req: AuthRequest, res: Response): Promise<Response> {
  //   const tenantId = req.user?.userId;
  //   if (!tenantId)
  //     return res
  //       .status(HttpStatus.UNAUTHORIZED)
  //       .json(new ApiResponses(false, "Unauthorized"));

  //   const payments = await this._paymentService.getTenantPayments(tenantId);
  //   return res
  //     .status(HttpStatus.OK)
  //     .json(new ApiResponses(true, "Payments fetched", { payments }));
  // }

  // controllers/implementation/tenant/tenant.payment.controller.ts
  // Replace getTenantPayments method:

  async getTenantPayments(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;
    if (!tenantId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

    const result = await this._paymentService.getTenantPayments(
      tenantId,
      req.query as GetPaymentsQueryDto,
    );

    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Payments fetched", result));
  }
  async getLeasePayments(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;
    if (!tenantId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

    const { leaseId } = req.params;
    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Lease ID required"));

    const payments = await this._paymentService.getLeasePayments(
      leaseId,
      tenantId,
    );
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Lease payments fetched", { payments }));
  }

  async createRentOrder(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;
    if (!tenantId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

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
      .json(new ApiResponses(true, "Rent order created", result));
  }
}
