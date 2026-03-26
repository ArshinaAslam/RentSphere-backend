import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";
import { AuthRequest } from "../../../middleware/auth.middleware";

import type {
  CreateLeaseDto,
  signLandlordLeaseDto,
  UpdateLeaseDto,
} from "../../../dto/landlord/landlord.lease.dto";
import type { ILandlordLeaseService } from "../../../services/interface/landlord/ILandlordLeaseService";

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
        .json(new ApiResponses(false, "Unauthorized"));

    const dto = req.body as CreateLeaseDto;
    const lease = await this._leaseService.createLease(dto, landlordId);
    return res
      .status(HttpStatus.CREATED)
      .json(new ApiResponses(true, "Lease created successfully", { lease }));
  }

  async updateLease(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

    const { leaseId } = req.params;
    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Lease ID required"));
    const dto = req.body as UpdateLeaseDto;
    const lease = await this._leaseService.updateLease(
      leaseId,
      dto,
      landlordId,
    );
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Lease updated successfully", { lease }));
  }

  async sendLease(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

    const { leaseId } = req.params;
    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Lease ID required"));
    const lease = await this._leaseService.sendLease(leaseId, landlordId);
    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponses(true, "Lease sent to tenant successfully", { lease }),
      );
  }

  // async getLandlordLeases(req: AuthRequest, res: Response): Promise<Response> {
  //   const landlordId = req.user?.userId;
  //   if (!landlordId)
  //     return res
  //       .status(HttpStatus.UNAUTHORIZED)
  //       .json(new ApiResponses(false, "Unauthorized"));

  //   const leases = await this._leaseService.getLandlordLeases(landlordId);
  //   return res
  //     .status(HttpStatus.OK)
  //     .json(new ApiResponses(true, "Leases fetched successfully", { leases }));
  // }

  async getLandlordLeases(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

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
      new ApiResponses(true, "Leases fetched successfully", {
        leases: result.leases,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      }),
    );
  }

  async getLeaseById(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

    const { leaseId } = req.params;
    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Lease ID required"));
    const lease = await this._leaseService.getLeaseById(leaseId, landlordId);

    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Lease fetched successfully", { lease }));
  }

  async terminateLease(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

    const { leaseId } = req.params;
    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Lease ID required"));
    const lease = await this._leaseService.terminateLease(leaseId, landlordId);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Lease terminated successfully", { lease }));
  }

  async deleteLease(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

    const { leaseId } = req.params;
    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Lease ID required"));
    await this._leaseService.deleteLease(leaseId, landlordId);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Lease deleted successfully"));
  }

  async signLease(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

    const { leaseId } = req.params;
    if (!leaseId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Lease ID required"));
    const dto = req.body as signLandlordLeaseDto;

    const lease = await this._leaseService.signLease(leaseId, landlordId, dto);
    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "Lease signed by landlord — now active", {
        lease,
      }),
    );
  }

  async searchTenants(req: AuthRequest, res: Response): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

    const search = req.query.q as string;
    if (!search || search.trim().length < 2)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Search query too short"));

    const tenants = await this._leaseService.searchTenants(
      search.trim(),
      landlordId,
    );
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Tenants found", { tenants }));
  }

  async getLandlordProperties(
    req: AuthRequest,
    res: Response,
  ): Promise<Response> {
    const landlordId = req.user?.userId;
    if (!landlordId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "Unauthorized"));

    const properties =
      await this._leaseService.getLandlordProperties(landlordId);
    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "Properties fetched successfully", {
        properties,
      }),
    );
  }
}
