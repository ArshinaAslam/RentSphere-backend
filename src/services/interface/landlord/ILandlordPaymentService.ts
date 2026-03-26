import type { PaymentResponseDto } from "../../../mappers/payment.mapper";

export interface ILandlordPaymentService {
  getLandlordPayments(landlordId: string): Promise<PaymentResponseDto[]>;
  getPaymentsByProperty(
    landlordId: string,
    propertyId: string,
  ): Promise<PaymentResponseDto[]>;
}
