import type { IPayment } from "../models/paymentModel";

export interface PaymentResponseDto {
  _id: string;
  leaseId: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  type: string;
  amount: number;
  platformFee: number;
  landlordAmount: number;
  status: string;
  dueDate?: string | undefined;
  paidAt?: string | undefined;
  razorpayOrderId?: string | undefined;
  month?: number | undefined;
  year?: number | undefined;
  notes?: string | undefined;
  createdAt: string;
}

export class PaymentMapper {
  static toDto(payment: IPayment): PaymentResponseDto {
    return {
      _id: String(payment._id),
      leaseId: String(payment.leaseId),
      tenantId: String(payment.tenantId),
      landlordId: String(payment.landlordId),
      propertyId: String(payment.propertyId),
      type: payment.type,
      amount: payment.amount,
      platformFee: payment.platformFee,
      landlordAmount: payment.landlordAmount,
      status: payment.status,
      dueDate: payment.dueDate
        ? new Date(payment.dueDate).toISOString()
        : undefined,
      paidAt: payment.paidAt
        ? new Date(payment.paidAt).toISOString()
        : undefined,
      razorpayOrderId: payment.razorpayOrderId,
      month: payment.month,
      year: payment.year,
      notes: payment.notes,
      createdAt: new Date(payment.createdAt).toISOString(),
    };
  }

  static toDtoList(payments: IPayment[]): PaymentResponseDto[] {
    return payments.map((p) => PaymentMapper.toDto(p));
  }
}
