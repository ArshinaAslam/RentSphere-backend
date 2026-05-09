export interface SubmitReviewDto {
  propertyId: string;
  leaseId: string;
  rating: number;
  comment: string;
}

export interface ReviewResponseDto {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  leaseId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
