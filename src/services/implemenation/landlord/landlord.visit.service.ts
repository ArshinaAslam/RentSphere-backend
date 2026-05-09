import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import {
  updateVisitStatusDto,
  VisitBookingResponseDto,
} from "../../../dto/landlord/landlord.visit.dto";
import { VisitBookingMapper } from "../../../mappers/visitBooking.mapper";
import { VisitBookingRepository } from "../../../repositories/implementation/visitBooking.repository";
import logger from "../../../utils/logger";

import type { ILandlordVisitService } from "../../interface/landlord/ILandlordVisitService";

@injectable()
export class LandlordVisitService implements ILandlordVisitService {
  constructor(
    @inject(DI_TYPES.VisitBookingRepository)
    private readonly _visitRepo: VisitBookingRepository,
  ) {}

  async getLandlordVisits(
    landlordId: string,
    page: number,
    limit: number,
    search: string,
  ): Promise<{ visits: VisitBookingResponseDto[]; total: number }> {
    logger.info("Fetching visits for landlord", { landlordId });
    const skip = (page - 1) * limit;

    const [visits, total] = await Promise.all([
      this._visitRepo.findByLandlordId(landlordId, skip, limit, search),
      this._visitRepo.countByLandlordId(landlordId, search),
    ]);

    logger.info("Landlord visits fetched", {
      landlordId,
      count: visits.length,
    });

    return {
      visits: VisitBookingMapper.toResponseDtoList(visits),
      total,
    };
  }

  async updateVisitStatus(
    landlordId: string,
    visitId: string,
    dto: updateVisitStatusDto,
  ): Promise<void> {
    logger.info("Updating visit status", {
      landlordId,
      visitId,
      status: dto.status,
    });

    if (!visitId) {
      throw new AppError(
        MESSAGES.VISIT.VISIT_ID_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const allowedStatuses = ["confirmed", "cancelled", "completed"];
    if (!allowedStatuses.includes(dto.status)) {
      throw new AppError(MESSAGES.VISIT.INVALID_STATUS, HttpStatus.BAD_REQUEST);
    }

    const visit = await this._visitRepo.findById(visitId);

    if (!visit) {
      throw new AppError(MESSAGES.VISIT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (String(visit.landlordId) !== landlordId) {
      throw new AppError(
        MESSAGES.VISIT.UNAUTHORIZED_VISIT,
        HttpStatus.FORBIDDEN,
      );
    }

    if (visit.status === "cancelled") {
      throw new AppError(
        MESSAGES.VISIT.ALREADY_CANCELLED,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (visit.status === "completed") {
      throw new AppError(
        MESSAGES.VISIT.ALREADY_COMPLETED_UPDATE,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this._visitRepo.updateStatus(visitId, dto.status);

    logger.info("Visit status updated successfully", {
      landlordId,
      visitId,
      status: dto.status,
    });
  }
}
