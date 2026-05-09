export interface ReviewResponseDto {
  reviewId: string;
  propertyId: string;
  tenantId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
