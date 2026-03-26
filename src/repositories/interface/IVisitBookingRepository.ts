import type { IBaseRepository } from "../../common/repository/IBaseRepository";
import type { IVisitBooking } from "../../models/visitBookingModel";

export interface IVisitBookingRepository extends IBaseRepository<IVisitBooking> {
  findBookedSlots(propertyId: string, date: string): Promise<string[]>;
  findExistingBooking(
    propertyId: string,
    date: string,
    timeSlot: string,
  ): Promise<IVisitBooking | null>;
  findByTenantId(tenantId: string): Promise<IVisitBooking[]>;
  findTenantBookingForProperty(
    tenantId: string,
    propertyId: string,
    date: string,
  ): Promise<IVisitBooking | null>;
  findByLandlordId(
    landlordId: string,
    skip: number,
    limit: number,
    search: string,
  ): Promise<IVisitBooking[]>;
  countByLandlordId(landlordId: string, search: string): Promise<number>;
  updateStatus(visitId: string, status: string): Promise<IVisitBooking | null>;
}
