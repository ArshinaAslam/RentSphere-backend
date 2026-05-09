import type { IBaseRepository } from "../../common/repository/IBaseRepository";
import type { IInquiry } from "../../models/inquiryModel";
import type { FilterQuery } from "mongoose";

export interface IInquiryRepository extends IBaseRepository<IInquiry> {
  createInquiry(data: Partial<IInquiry>): Promise<IInquiry>;
  findByLandlordId(landlordId: string): Promise<IInquiry[]>;
  buildSearchQuery(
    landlordId: string,
    search: string,
  ): Promise<FilterQuery<IInquiry>>;
  findByLandlordIdPaginated(
    landlordId: string,
    skip: number,
    limit: number,
    search: string,
  ): Promise<IInquiry[]>;
  countByLandlordId(landlordId: string, search: string): Promise<number>;
  findByTenantIdPaginated(
    tenantId: string,
    skip: number,
    limit: number,
    search: string,
  ): Promise<IInquiry[]>;
  countByTenantId(tenantId: string, search: string): Promise<number>;
  markAsRead(inquiryId: string): Promise<void>;
}
