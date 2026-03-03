import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { BookVisitDto } from "../../../dto/tenant/tenant.visit.dto";
import { VisitBookingRepository } from "../../../repositories/implementation/visitBooking.repository";
import logger from "../../../utils/logger";

import type { IVisitBooking } from "../../../models/visitBookingModel";
import { VisitBookingMapper, VisitBookingResponseDto } from "../../../mappers/visitBooking.mapper";

@injectable()
export class TenantVisitService {
  constructor(
    @inject(DI_TYPES.VisitBookingRepository)
    private readonly _visitRepo: VisitBookingRepository,
  ) {}

  async getBookedSlots(propertyId: string, date: string): Promise<string[]> {
    if (!propertyId || !date) {
      throw new AppError(
        "propertyId and date are required",
        HttpStatus.BAD_REQUEST,
      );
    }

    logger.info("Fetching booked slots", { propertyId, date });

    return this._visitRepo.findBookedSlots(propertyId, date);
  }

  async bookVisit(tenantId: string, dto: BookVisitDto): Promise<void> {
    const { propertyId, landlordId, date, timeSlot } = dto;

    if (!propertyId || !landlordId || !date || !timeSlot) {
      throw new AppError(
        "propertyId, landlordId, date and timeSlot are required",
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingSlot = await this._visitRepo.findExistingBooking(
      propertyId,
      date,
      timeSlot,
    );

    if (existingSlot) {
      throw new AppError(
        "This time slot is already booked. Please choose another.",
        HttpStatus.CONFLICT,
      );
    }

    const duplicate = await this._visitRepo.findTenantBookingForProperty(
  tenantId,
  propertyId,
  date,
);
    if (duplicate) {
      throw new AppError(
        "You already have a visit booked for this property on this date.",
        HttpStatus.CONFLICT,
      );
    }

    await this._visitRepo.createSlot({
  propertyId,
  tenantId,
  landlordId,
  date,
  timeSlot,
  status: "confirmed",
});

    logger.info("Visit booked successfully", {
      tenantId,
      propertyId,
      date,
      timeSlot,
    });
  }

  async getTenantVisits(tenantId: string): Promise<VisitBookingResponseDto[]> {
    logger.info("Fetching visits for tenant", { tenantId });

    const visits = await this._visitRepo.findByTenantId(tenantId);
    

    logger.info("Visits fetched", { tenantId, count: visits.length });

    const mappedVisits = VisitBookingMapper.toResponseDtoList(visits);
   
       return mappedVisits;
  }

  async cancelVisit(tenantId: string, visitId: string): Promise<void> {
    logger.info("Cancelling visit", { tenantId, visitId });

    const visit = await this._visitRepo.findById(visitId);

    if (!visit) {
      throw new AppError("Visit not found", HttpStatus.NOT_FOUND);
    }

   
    if (String(visit.tenantId) !== tenantId) {
      throw new AppError(
        "Unauthorized: This is not your booking",
        HttpStatus.FORBIDDEN,
      );
    }

    if (visit.status === "cancelled") {
      throw new AppError("Visit is already cancelled", HttpStatus.BAD_REQUEST);
    }

    if (visit.status === "completed") {
      throw new AppError(
        "Cannot cancel a completed visit",
        HttpStatus.BAD_REQUEST,
      );
    }

    await this._visitRepo.updateStatus(visitId, "cancelled");

    logger.info("Visit cancelled successfully", { tenantId, visitId });
  }
}
