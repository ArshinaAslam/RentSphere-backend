export interface PaymentResponseDto {
  paymentId: string;
  leaseId: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  status: string;
  paidAt: Date | null;
  dueDate: Date;
  createdAt: Date;
}
