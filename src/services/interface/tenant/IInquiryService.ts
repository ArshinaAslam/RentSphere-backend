import type { CreateInquiryDto } from "../../../dto/tenant/tenant.inquiry.dto";

export interface ITenantInquiryService {
  createInquiry(tenantId: string, dto: CreateInquiryDto): Promise<void>;
}
