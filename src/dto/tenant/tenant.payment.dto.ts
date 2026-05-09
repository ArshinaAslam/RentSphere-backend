import type { PaymentResponseDto } from "../../mappers/payment.mapper";

export interface CreateDepositOrderDto {
  leaseId: string;
}

export interface CreateRentOrderDto {
  leaseId: string;
  month: number;
  year: number;
}

export interface VerifyPaymentDto {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentId: string;
}

export interface GetPaymentsQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  type?: string;
  status?: string;
}

export interface GetTenantPropertyPaymentsDto {
  propertyId: string;
  tenantId: string;
  page: number;
  limit: number;
  type?: string;
  status?: string;
}

export interface TenantPaymentsResultDto {
  payments: PaymentResponseDto[];
  total: number;
  page: number;
  limit: number;
}
