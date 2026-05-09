import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import logger from "../../../utils/logger";
import { createAndEmitNotification } from "../../../utils/notificationEmitter";

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
      throw new AppError(MESSAGES.INQUIRY.REQUIRED_IDS, HttpStatus.BAD_REQUEST);
    }

    if (!questions || questions.length === 0) {
      throw new AppError(
        MESSAGES.INQUIRY.QUESTION_REQUIRED,
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
    await createAndEmitNotification({
      recipientId: landlordId,
      recipientRole: "landlord",
      type: "inquiry_received",
      title: "New Inquiry Received",
      message: "A tenant has sent an inquiry about your property.",
      link: "/landlord/enquiries",
    });
  }

  async getTenantInquiries(
    tenantId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    inquiries: IInquiry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [inquiries, total] = await Promise.all([
      this._inquiryRepo.findByTenantIdPaginated(
        tenantId,
        skip,
        limit,
        search ?? "",
      ),
      this._inquiryRepo.countByTenantId(tenantId, search ?? ""),
    ]);
    return { inquiries, total, page, totalPages: Math.ceil(total / limit) };
  }
}
