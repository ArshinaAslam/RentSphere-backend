import type { PaymentResponseDto } from "../../../mappers/payment.mapper";

export interface PaginatedLandlordPayments {
  payments: PaymentResponseDto[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ILandlordPaymentService {
  getPaymentsByProperty(
    landlordId: string,
    propertyId: string,
  ): Promise<PaymentResponseDto[]>;
  getPaymentById(
    paymentId: string,
    landlordId: string,
  ): Promise<PaymentResponseDto>;
  getLandlordPayments(
    landlordId: string,
    raw: {
      page?: string;
      limit?: string;
      search?: string;
      type?: string;
      status?: string;
    },
  ): Promise<PaginatedLandlordPayments>;
}
