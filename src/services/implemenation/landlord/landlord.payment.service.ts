import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { PaymentMapper } from "../../../mappers/payment.mapper";

import type { PaymentResponseDto } from "../../../mappers/payment.mapper";
import type { IPaymentRepository } from "../../../repositories/interface/IPaymentRepository";
import type { ILandlordPaymentService } from "../../interface/landlord/ILandlordPaymentService";

@injectable()
export class LandlordPaymentService implements ILandlordPaymentService {
  constructor(
    @inject(DI_TYPES.PaymentRepository)
    private _paymentRepo: IPaymentRepository,
  ) {}

  async getLandlordPayments(landlordId: string): Promise<PaymentResponseDto[]> {
    const payments = await this._paymentRepo.findByLandlordId(landlordId);
    return PaymentMapper.toDtoList(payments);
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
