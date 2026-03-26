import type {
  updateVisitStatusDto,
  VisitBookingResponseDto,
} from "../../../dto/landlord/landlord.visit.dto";

export interface ILandlordVisitService {
  getLandlordVisits(
    landlordId: string,
    page: number,
    limit: number,
    search: string,
  ): Promise<{ visits: VisitBookingResponseDto[]; total: number }>;
  updateVisitStatus(
    landlordId: string,
    visitId: string,
    status: updateVisitStatusDto,
  ): Promise<void>;
}
