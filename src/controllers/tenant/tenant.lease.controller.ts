import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import { AuthRequest } from "../../middleware/auth.middleware";

import type { SignLeaseDto } from "../../dto/tenant/tenant.lease.dto";
import type { ITenantLeaseService } from "../../services/interface/tenant/ITenantLeaseService";

@injectable()
export class TenantLeaseController {
  constructor(
    @inject(DI_TYPES.TenantLeaseService)
    private readonly _leaseService: ITenantLeaseService,
  ) {}

  async getTenantLeases(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;

    if (!tenantId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const leases = await this._leaseService.getTenantLeases(tenantId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success({ leases }, MESSAGES.LEASE.FETCH_ALL_SUCCESS));
  }

  async getLeaseById(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;

    if (!tenantId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const { leaseId } = req.params;

    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error("Lease ID required"));

    const lease = await this._leaseService.getLeaseById(leaseId, tenantId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success({ lease }, MESSAGES.LEASE.FETCH_ONE_SUCCESS));
  }

  async markAsViewed(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;

    if (!tenantId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const { leaseId } = req.params;

    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.LEASE.ID_REQUIRED));

    const lease = await this._leaseService.markAsViewed(leaseId, tenantId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success({ lease }, MESSAGES.LEASE.VIEWED_SUCCESS));
  }

  async signLease(req: AuthRequest, res: Response): Promise<Response> {
    const tenantId = req.user?.userId;

    if (!tenantId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const { leaseId } = req.params;

    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.LEASE.ID_REQUIRED));

    const dto = req.body as SignLeaseDto;

    const lease = await this._leaseService.signLease(leaseId, tenantId, dto);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success({ lease }, MESSAGES.LEASE.SIGN_SUCCESS));
  }
}
