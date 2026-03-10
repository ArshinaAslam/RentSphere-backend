import type {
  updateVisitStatusDto,
  VisitBookingResponseDto,
} from "../../../dto/landlord/landlord.visit.dto";

export interface ILandlordVisitService {
  getLandlordVisits(landlordId: string): Promise<VisitBookingResponseDto[]>;
  updateVisitStatus(
    landlordId: string,
    visitId: string,
    status: updateVisitStatusDto,
  ): Promise<void>;
}
