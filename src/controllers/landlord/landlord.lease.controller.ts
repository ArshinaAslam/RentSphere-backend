import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import { AuthRequest } from "../../middleware/auth.middleware";

import type {
  CreateLeaseDto,
  signLandlordLeaseDto,
  UpdateLeaseDto,
} from "../../dto/landlord/landlord.lease.dto";
import type { ILandlordLeaseService } from "../../services/interface/landlord/ILandlordLeaseService";

@injectable()
export class LandlordLeaseController {
  constructor(
    @inject(DI_TYPES.LandlordLeaseService)
    private readonly _leaseService: ILandlordLeaseService,
  ) {}

  async createLease(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const dto = req.body as CreateLeaseDto;
    const lease = await this._leaseService.createLease(dto, landlordId);

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponses.success({ lease }, MESSAGES.LEASE.CREATE_SUCCESS));
  }

  async updateLease(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const { leaseId } = req.params;
    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.LEASE.ID_REQUIRED));

    const dto = req.body as UpdateLeaseDto;
    const lease = await this._leaseService.updateLease(
      leaseId,
      dto,
      landlordId,
    );

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success({ lease }, MESSAGES.LEASE.UPDATE_SUCCESS));
  }

  async sendLease(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const { leaseId } = req.params;
    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.LEASE.ID_REQUIRED));

    const lease = await this._leaseService.sendLease(leaseId, landlordId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success({ lease }, MESSAGES.LEASE.SEND_SUCCESS));
  }

  async getLandlordLeases(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) ?? "";

    const result = await this._leaseService.getLandlordLeases(
      landlordId,
      page,
      limit,
      search,
    );

    return res.status(HttpStatus.OK).json(
      ApiResponses.success(
        {
          leases: result.leases,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
        MESSAGES.LEASE.FETCH_ALL_SUCCESS,
      ),
    );
  }

  async getLeaseById(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const { leaseId } = req.params;
    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.LEASE.ID_REQUIRED));

    const lease = await this._leaseService.getLeaseById(leaseId, landlordId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success({ lease }, MESSAGES.LEASE.FETCH_ONE_SUCCESS));
  }

  async terminateLease(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const { leaseId } = req.params;
    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.LEASE.ID_REQUIRED));

    const lease = await this._leaseService.terminateLease(leaseId, landlordId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success({ lease }, MESSAGES.LEASE.TERMINATE_SUCCESS));
  }

  async deleteLease(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const { leaseId } = req.params;
    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error("Lease ID required"));

    await this._leaseService.deleteLease(leaseId, landlordId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(null, MESSAGES.LEASE.DELETE_SUCCESS));
  }

  async signLease(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const { leaseId } = req.params;
    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.LEASE.ID_REQUIRED));

    const dto = req.body as signLandlordLeaseDto;

    const lease = await this._leaseService.signLease(leaseId, landlordId, dto);

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponses.success({ lease }, MESSAGES.LEASE.SIGN_LANDLORD_SUCCESS),
      );
  }

  async searchTenants(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const search = req.query.q as string;
    if (!search || search.trim().length < 2)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.LEASE.SEARCH_TOO_SHORT));

    const tenants = await this._leaseService.searchTenants(
      search.trim(),
      landlordId,
    );

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success({ tenants }, MESSAGES.LEASE.TENANTS_FOUND));
  }

  async getLandlordProperties(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.LEASE.UNAUTHORIZED));

    const properties =
      await this._leaseService.getLandlordProperties(landlordId);

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponses.success(
          { properties },
          MESSAGES.LEASE.PROPERTIES_FETCH_SUCCESS,
        ),
      );
  }
}
