import type {
  CreateDepositOrderDto,
  CreateRentOrderDto,
  GetPaymentsQueryDto,
  VerifyPaymentDto,
} from "../../../dto/tenant/tenant.payment.dto";
import type { PaymentResponseDto } from "../../../mappers/payment.mapper";

export interface PaginatedPayments {
  payments: PaymentResponseDto[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ITenantPaymentService {
  createDepositOrder(
    dto: CreateDepositOrderDto,
    tenantId: string,
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    paymentId: string;
    keyId: string;
  }>;
  createRentOrder(
    dto: CreateRentOrderDto,
    tenantId: string,
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    paymentId: string;
    keyId: string;
  }>;
  verifyAndCompletePayment(
    dto: VerifyPaymentDto,
    tenantId: string,
  ): Promise<PaymentResponseDto>;

  getTenantPayments(
    tenantId: string,
    query: GetPaymentsQueryDto,
  ): Promise<PaginatedPayments>;
  getLeasePayments(
    leaseId: string,
    tenantId: string,
  ): Promise<PaymentResponseDto[]>;
}
