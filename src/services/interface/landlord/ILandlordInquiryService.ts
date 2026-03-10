import type { IInquiry } from "../../../models/inquiryModel";

export interface GetInquiriesParams {
  page: number;
  limit: number;
  search: string;
}

export interface GetInquiriesResult {
  inquiries: IInquiry[];
  total: number;
  page: number;
  limit: number;
}

export interface ILandlordInquiryService {
  getLandlordInquiries(
    landlordId: string,
    params: GetInquiriesParams,
  ): Promise<GetInquiriesResult>;
}
