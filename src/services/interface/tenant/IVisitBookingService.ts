import type { BookVisitDto } from "../../../dto/tenant/tenant.visit.dto";
import type { IVisitBooking } from "../../../models/visitBookingModel";

export interface IVisitBookingService {
  getBookedSlots(propertyId: string, date: string): Promise<string[]>;
  bookVisit(tenantId: string, dto: BookVisitDto): Promise<void>;
  getTenantVisits(tenantId: string): Promise<IVisitBooking[]>;
  cancelVisit(tenantId: string, visitId: string): Promise<void>;
}
