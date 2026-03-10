export interface CreateInquiryDto {
  propertyId: string;
  landlordId: string;
  questions: string[];
  message: string;
}
