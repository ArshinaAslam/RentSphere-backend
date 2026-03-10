import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import logger from "../../../utils/logger";

import type { CreateInquiryDto } from "../../../dto/tenant/tenant.inquiry.dto";
import type { IInquiry } from "../../../models/inquiryModel";
import type { IInquiryRepository } from "../../../repositories/interface/IInquiryRepository";
import type { ITenantInquiryService } from "../../interface/tenant/IInquiryService";

@injectable()
export class TenantInquiryService implements ITenantInquiryService {
  constructor(
    @inject(DI_TYPES.InquiryRepository)
    private readonly _inquiryRepo: IInquiryRepository,
  ) {}

  async createInquiry(tenantId: string, dto: CreateInquiryDto): Promise<void> {
    const { propertyId, landlordId, questions, message } = dto;

    if (!propertyId || !landlordId) {
      throw new AppError(
        "propertyId and landlordId are required",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!questions || questions.length === 0) {
      throw new AppError(
        "At least one question is required",
        HttpStatus.BAD_REQUEST,
      );
    }

    await this._inquiryRepo.createInquiry({
      propertyId,
      tenantId,
      landlordId,
      questions,
      message,
    } as Partial<IInquiry>);

    logger.info("Inquiry created successfully", { tenantId, propertyId });
  }
}
