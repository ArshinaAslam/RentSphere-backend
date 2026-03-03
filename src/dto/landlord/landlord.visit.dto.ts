export interface VisitBookingResponseDto {
  _id:        string;
  propertyId: string | PropertySummary;
  tenantId:   string | TenantSummary;
  landlordId: string;
  date:       string;
  timeSlot:   string;
  status:     string;
  createdAt:  string;
}


export interface updateVisitStatusDto {
    status: "confirmed" | "cancelled" | "completed";
    
}
