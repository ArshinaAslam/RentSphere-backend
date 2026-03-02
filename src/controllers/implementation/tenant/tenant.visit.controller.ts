import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";
import { BookVisitDto } from "../../../dto/tenant/tenant.visit.dto";
import logger from "../../../utils/logger";

import type { AuthRequest } from "../../../middleware/auth.middleware";
import type { IVisitBookingService } from "../../../services/interface/tenant/IVisitBookingService";

@injectable()
export class TenantVisitController {
  constructor(
    @inject(DI_TYPES.VisitBookingService)
    private readonly _visitBookingService: IVisitBookingService,
  ) {}

  async getBookedSlots(req: AuthRequest, res: Response): Promise<Response> {
    logger.info("Tenant fetching booked slots", { ip: req.ip });

    const { propertyId, date } = req.query as {
      propertyId: string;
      date: string;
    };

    if (!propertyId || !date) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Property ID and date are required", {}));
    }

    const bookedSlots = await this._visitBookingService.getBookedSlots(
      propertyId,
      date,
    );

    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "Booked slots fetched successfully", {
        bookedSlots,
      }),
    );
  }

  async bookVisit(req: AuthRequest, res: Response): Promise<Response> {
    logger.info("Tenant booking visit request");

    const tenantId = req.user?.userId;

    if (!tenantId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated", {}));
    }

    const dto = req.body as BookVisitDto;

    if (!dto.propertyId || !dto.landlordId || !dto.date || !dto.timeSlot) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "All booking fields are required", {}));
    }

    await this._visitBookingService.bookVisit(tenantId, dto);

    return res
      .status(HttpStatus.CREATED)
      .json(new ApiResponses(true, "Visit booked successfully", {}));
  }

  async getTenantVisits(req: AuthRequest, res: Response): Promise<Response> {
    logger.info("Tenant fetching their visits");

    const tenantId = req.user?.userId;

    if (!tenantId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated", {}));
    }

    const visits = await this._visitBookingService.getTenantVisits(tenantId);

    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Visits fetched successfully", { visits }));
  }

  async cancelVisit(req: AuthRequest, res: Response): Promise<Response> {
    logger.info("Tenant cancelling visit");

    const tenantId = req.user?.userId;
    const { id: visitId } = req.params as { id: string };

    if (!tenantId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated", {}));
    }

    if (!visitId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Visit ID is required", {}));
    }

    await this._visitBookingService.cancelVisit(tenantId, visitId);

    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Visit cancelled successfully", {}));
  }
}
