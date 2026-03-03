import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { VisitBookingMapper } from "../../../mappers/visitBooking.mapper";
import { VisitBookingRepository } from "../../../repositories/implementation/visitBooking.repository";
import logger from "../../../utils/logger";

import type { ILandlordVisitService } from "../../interface/landlord/ILandlordVisitService";
import { updateVisitStatusDto, VisitBookingResponseDto } from "../../../dto/landlord/landlord.visit.dto";

@injectable()
export class LandlordVisitService implements ILandlordVisitService {
  constructor(
    @inject(DI_TYPES.VisitBookingRepository)
    private readonly _visitRepo: VisitBookingRepository,
  ) {}

  async getLandlordVisits(
    landlordId: string,
  ): Promise<VisitBookingResponseDto[]> {
    logger.info("Fetching visits for landlord", { landlordId });

    const visits = await this._visitRepo.findByLandlordId(landlordId);

    logger.info("Landlord visits fetched", {
      landlordId,
      count: visits.length,
    });

    const mappedVisits = VisitBookingMapper.toResponseDtoList(visits);

    return mappedVisits;
  }

 async updateVisitStatus(
  landlordId: string,
  visitId:    string,
  dto:     updateVisitStatusDto,
): Promise<void> {
    logger.info("Updating visit status", {
      landlordId,
      visitId,
      status: dto.status,
    });

  if (!visitId) {
    throw new AppError("Visit ID is required", HttpStatus.BAD_REQUEST);
  }

  const allowedStatuses = ["confirmed", "cancelled", "completed"];
  if (!allowedStatuses.includes(dto.status)) {
    throw new AppError("Invalid status value", HttpStatus.BAD_REQUEST);
  }

  const visit = await this._visitRepo.findById(visitId);

  if (!visit) {
    throw new AppError("Visit not found", HttpStatus.NOT_FOUND);
  }

  if (String(visit.landlordId) !== landlordId) {
    throw new AppError(
      "Unauthorized: This is not your property visit",
        HttpStatus.FORBIDDEN,
    );
  }

  if (visit.status === "cancelled") {
    throw new AppError("Visit is already cancelled", HttpStatus.BAD_REQUEST);
  }

  if (visit.status === "completed") {
      throw new AppError(
        "Cannot update a completed visit",
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