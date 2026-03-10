import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";
import { updateVisitStatusDto } from "../../../dto/landlord/landlord.visit.dto";
import logger from "../../../utils/logger";

import type { AuthRequest } from "../../../middleware/auth.middleware";
import type { ILandlordVisitService } from "../../../services/interface/landlord/ILandlordVisitService";

@injectable()
export class LandlordVisitController {
  constructor(
    @inject(DI_TYPES.LandlordVisitService)
    private readonly _landlordVisitService: ILandlordVisitService,
  ) {}

  async getLandlordVisits(req: AuthRequest, res: Response): Promise<Response> {
    logger.info("Landlord fetching visit requests");

    const landlordId = req.user?.userId;

    if (!landlordId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated", {}));
    }

    const visits =
      await this._landlordVisitService.getLandlordVisits(landlordId);

    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "Visit requests fetched successfully", {
        visits,
      }),
    );
  }

  async updateVisitStatus(req: AuthRequest, res: Response): Promise<Response> {
    logger.info("Landlord updating visit status");

    const landlordId = req.user?.userId;
    const { id: visitId } = req.params as { id: string };
    const dto = req.body as updateVisitStatusDto;

    if (!landlordId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated", {}));
    }

    await this._landlordVisitService.updateVisitStatus(
      landlordId,
      visitId,
      dto,
    );

    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Visit status updated successfully", {}));
  }
}
