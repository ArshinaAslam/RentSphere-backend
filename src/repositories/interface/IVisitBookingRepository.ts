import type { IBaseRepository } from "../../../common/repository/IBaseRepository";
import type { IVisitBooking } from "../../../models/visitBookingModel";

export interface IVisitBookingRepository extends IBaseRepository<IVisitBooking> {
  findBookedSlots(propertyId: string, date: string): Promise<string[]>;
  findExistingBooking(
    propertyId: string,
    date: string,
    timeSlot: string,
  ): Promise<IVisitBooking | null>;
  findByTenantId(tenantId: string): Promise<IVisitBooking[]>;
  findByLandlordId(landlordId: string): Promise<IVisitBooking[]>;
  updateStatus(visitId: string, status: string): Promise<IVisitBooking | null>;
}
