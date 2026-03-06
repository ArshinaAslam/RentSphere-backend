import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import type { IInquiryRepository } from "../../../repositories/interface/IInquiryRepository";
import type {
  ILandlordInquiryService,
  GetInquiriesParams,
  GetInquiriesResult,
} from "../../interface/landlord/ILandlordInquiryService";
import type { IInquiry } from "../../../models/inquiryModel";
import logger from "../../../utils/logger";

@injectable()
export class LandlordInquiryService implements ILandlordInquiryService {
  constructor(
    @inject(DI_TYPES.InquiryRepository)
    private readonly _inquiryRepo: IInquiryRepository,
  ) {}

  async getLandlordInquiries(
    landlordId: string,
    params:     GetInquiriesParams,
  ): Promise<GetInquiriesResult> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    logger.info("Fetching landlord inquiries", {
      landlordId,
      page,
      limit,
      search,
    });

    const [inquiries, total]: [IInquiry[], number] = await Promise.all([
      this._inquiryRepo.findByLandlordIdPaginated(
        landlordId,
        skip,
        limit,
        search,
      ),
      this._inquiryRepo.countByLandlordId(landlordId, search),
    ]);

    console.log("inquiriezzzz",inquiries)
    console.log("total",total)

    logger.info("Landlord inquiries fetched", {
      landlordId,
      count: inquiries.length,
      total,
    });

    return { inquiries, total, page, limit };
  }
}