import type { CreateInquiryDto } from "../../../dto/tenant/tenant.inquiry.dto";
import type { IInquiry } from "../../../models/inquiryModel";

export interface ITenantInquiryService {
  createInquiry(tenantId: string, dto: CreateInquiryDto): Promise<void>;
  getTenantInquiries(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{
    inquiries: IInquiry[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}
