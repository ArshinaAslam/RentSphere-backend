import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { PaymentMapper } from "../../../mappers/payment.mapper";

import type { PaymentResponseDto } from "../../../mappers/payment.mapper";
import type { IPaymentRepository } from "../../../repositories/interface/IPaymentRepository";
import type {
  ILandlordPaymentService,
  PaginatedLandlordPayments,
} from "../../interface/landlord/ILandlordPaymentService";

@injectable()
export class LandlordPaymentService implements ILandlordPaymentService {
  constructor(
    @inject(DI_TYPES.PaymentRepository)
    private _paymentRepo: IPaymentRepository,
  ) {}

  async getLandlordPayments(
    landlordId: string,
    raw: {
      page?: string;
      limit?: string;
      search?: string;
      type?: string;
      status?: string;
    },
  ): Promise<PaginatedLandlordPayments> {
    const page = parseInt(raw.page ?? "") || 1;
    const limit = parseInt(raw.limit ?? "") || 10;

    const filters: { search?: string; type?: string; status?: string } = {};
    if (raw.search) filters.search = raw.search;
    if (raw.type) filters.type = raw.type;
    if (raw.status) filters.status = raw.status;

    const { data, total } = await this._paymentRepo.findByLandlordIdPaginated(
      landlordId,
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

  async getPaymentById(
    paymentId: string,
    landlordId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this._paymentRepo.findPaymentById(paymentId);
    if (!payment)
      throw new AppError(MESSAGES.PAYMENT.NOT_FOUND, HttpStatus.NOT_FOUND);
    if (String(payment.landlordId) !== landlordId)
      throw new AppError(MESSAGES.PAYMENT.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    return PaymentMapper.toDto(payment);
  }

  async getPaymentsByProperty(
    landlordId: string,
    propertyId: string,
  ): Promise<PaymentResponseDto[]> {
    const payments = await this._paymentRepo.findByLandlordIdAndPropertyId(
      landlordId,
      propertyId,
    );
    return PaymentMapper.toDtoList(payments);
  }
}
