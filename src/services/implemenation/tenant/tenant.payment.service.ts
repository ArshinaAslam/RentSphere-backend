import crypto from "crypto";

import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { razorpay, PLATFORM_FEE_PERCENT } from "../../../config/razorPay";
import { PaymentMapper } from "../../../mappers/payment.mapper";
import logger from "../../../utils/logger";

import type {
  CreateDepositOrderDto,
  GetPaymentsQueryDto,
  VerifyPaymentDto,
} from "../../../dto/tenant/tenant.payment.dto";
import type { PaymentResponseDto } from "../../../mappers/payment.mapper";
import type { ILeaseRepository } from "../../../repositories/interface/ILeaseRepository";
import type { IPaymentRepository } from "../../../repositories/interface/IPaymentRepository";
import type {
  ITenantPaymentService,
  PaginatedPayments,
} from "../../interface/tenant/IPaymentService";

@injectable()
export class TenantPaymentService implements ITenantPaymentService {
  constructor(
    @inject(DI_TYPES.PaymentRepository)
    private _paymentRepo: IPaymentRepository,

    @inject(DI_TYPES.LeaseRepository)
    private _leaseRepo: ILeaseRepository,
  ) {}

  async createDepositOrder(
    dto: CreateDepositOrderDto,
    tenantId: string,
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    paymentId: string;
    keyId: string;
  }> {
    const lease = await this._leaseRepo.findById(dto.leaseId);
    if (!lease) throw new AppError("Lease not found", HttpStatus.NOT_FOUND);

    const leaseTenantId =
      typeof lease.tenantId === "object" && lease.tenantId !== null
        ? String((lease.tenantId as { _id: string })._id)
        : String(lease.tenantId);
    if (String(leaseTenantId) !== tenantId)
      throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);
    if (!["signed", "active"].includes(lease.status))
      throw new AppError(
        "Lease must be signed before paying deposit",
        HttpStatus.BAD_REQUEST,
      );

    const existingPayments = await this._paymentRepo.findByLeaseId(dto.leaseId);
    const depositPaid = existingPayments.some(
      (p) => p.type === "deposit" && p.status === "completed",
    );
    if (depositPaid)
      throw new AppError(
        "Deposit already paid for this lease",
        HttpStatus.BAD_REQUEST,
      );

    const amount = lease.securityDeposit;
    const platformFee = 0;
    const landlordAmount = amount;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      notes: {
        leaseId: String(lease._id),
        tenantId,
        type: "deposit",
      },
    });

    // ── Save payment record ──
    const payment = await this._paymentRepo.createPayment({
      leaseId: String(lease._id),
      tenantId,
      landlordId:
        typeof lease.landlordId === "object" && lease.landlordId !== null
          ? String((lease.landlordId as { _id: string })._id)
          : String(lease.landlordId),

      propertyId:
        typeof lease.propertyId === "object" && lease.propertyId !== null
          ? String((lease.propertyId as { _id: string })._id)
          : String(lease.propertyId),
      type: "deposit",
      amount,
      platformFee,
      landlordAmount,
      status: "pending",
      razorpayOrderId: order.id,
    });

    logger.info("Deposit order created", {
      paymentId: String(payment._id),
      orderId: order.id,
      amount,
    });

    return {
      orderId: order.id,
      amount: amount * 100,
      currency: "INR",
      paymentId: String(payment._id),
      keyId: process.env.RAZORPAY_KEY_ID!,
    };
  }

  // ── Create Rent Order ── (NEW — for monthly rent)
  async createRentOrder(
    dto: { leaseId: string; month: number; year: number },
    tenantId: string,
  ): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    paymentId: string;
    keyId: string;
  }> {
    const lease = await this._leaseRepo.findById(dto.leaseId);
    if (!lease) throw new AppError("Lease not found", HttpStatus.NOT_FOUND);

    if (String(lease.tenantId) !== tenantId)
      throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);
    if (lease.status !== "active")
      throw new AppError(
        "Lease must be active to pay rent",
        HttpStatus.BAD_REQUEST,
      );

    // ── Check if rent already paid for this month ──
    const existingPayments = await this._paymentRepo.findByLeaseId(dto.leaseId);
    const alreadyPaid = existingPayments.some(
      (p) =>
        p.type === "rent" &&
        p.status === "completed" &&
        p.month === dto.month &&
        p.year === dto.year,
    );
    if (alreadyPaid)
      throw new AppError(
        "Rent already paid for this month",
        HttpStatus.BAD_REQUEST,
      );

    // ── Calculate split ──
    const amount = lease.rentAmount;
    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT);
    const landlordAmount = amount - platformFee;

    // ── Create Razorpay order ──
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      notes: {
        leaseId: String(lease._id),
        tenantId,
        type: "rent",
        month: String(dto.month),
        year: String(dto.year),
      },
    });

    const dueDate = new Date(dto.year, dto.month - 1, lease.paymentDueDay);

    const payment = await this._paymentRepo.createPayment({
      leaseId: String(lease._id),
      tenantId,
      landlordId: String(lease.landlordId),
      propertyId: String(lease.propertyId),
      type: "rent",
      amount,
      platformFee,
      landlordAmount,
      status: "pending",
      razorpayOrderId: order.id,
      month: dto.month,
      year: dto.year,
      dueDate,
    });

    return {
      orderId: order.id,
      amount: amount * 100,
      currency: "INR",
      paymentId: String(payment._id),
      keyId: process.env.RAZORPAY_KEY_ID!,
    };
  }

  async verifyAndCompletePayment(
    dto: VerifyPaymentDto,
    tenantId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this._paymentRepo.findById(dto.paymentId);
    if (!payment) throw new AppError("Payment not found", HttpStatus.NOT_FOUND);
    if (String(payment.tenantId) !== tenantId)
      throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);

    // ── Verify Razorpay signature ──
    const body = `${dto.razorpayOrderId}|${dto.razorpayPaymentId}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== dto.razorpaySignature) {
      await this._paymentRepo.updateStatus(dto.paymentId, "failed");
      throw new AppError("Invalid payment signature", HttpStatus.BAD_REQUEST);
    }

    const updated = await this._paymentRepo.updateStatus(
      dto.paymentId,
      "completed",
      {
        razorpayPaymentId: dto.razorpayPaymentId,
        razorpaySignature: dto.razorpaySignature,
        paidAt: new Date(),
      },
    );

    if (!updated) throw new AppError("Payment not found", HttpStatus.NOT_FOUND);

    logger.info("Payment completed", {
      paymentId: dto.paymentId,
      razorpayPaymentId: dto.razorpayPaymentId,
      amount: payment.amount,
    });

    return PaymentMapper.toDto(updated);
  }

  // async getTenantPayments(tenantId: string): Promise<PaymentResponseDto[]> {
  //   const payments = await this._paymentRepo.findByTenantId(tenantId);
  //   return PaymentMapper.toDtoList(payments);
  // }

  // services/implementation/tenant/tenant.payment.service.ts  — update getTenantPayments

  async getTenantPayments(
    tenantId: string,
    dto: GetPaymentsQueryDto,
  ): Promise<PaginatedPayments> {
    const page = parseInt(dto.page ?? "") || 1;
    const limit = parseInt(dto.limit ?? "") || 5;

    const filters: { search?: string; type?: string; status?: string } = {};
    if (dto.search) filters.search = dto.search;
    if (dto.type) filters.type = dto.type;
    if (dto.status) filters.status = dto.status;

    const { data, total } = await this._paymentRepo.findByTenantIdPaginated(
      tenantId,
      page,
      limit,
      filters,
    );

    return {
      payments: PaymentMapper.toDtoList(data),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
  async getLeasePayments(
    leaseId: string,
    tenantId: string,
  ): Promise<PaymentResponseDto[]> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease) throw new AppError("Lease not found", HttpStatus.NOT_FOUND);
    if (String(lease.tenantId) !== tenantId)
      throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);

    const payments = await this._paymentRepo.findByLeaseId(leaseId);
    return PaymentMapper.toDtoList(payments);
  }
}
