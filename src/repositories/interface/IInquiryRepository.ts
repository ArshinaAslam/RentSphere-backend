import type { FilterQuery } from "mongoose";
import type { IBaseRepository } from "../../common/repository/IBaseRepository";
import type { IInquiry } from "../../models/inquiryModel";

// export interface IInquiryRepository extends IBaseRepository<IInquiry>{
  
//   createInquiry(data: Partial<IInquiry>): Promise<IInquiry>;
//   findByPropertyId(propertyId: string):            Promise<IInquiry[]>;
//   //
//   findByLandlordId(landlordId: string): Promise<IInquiry[]>;
//   findByTenantId(tenantId: string):     Promise<IInquiry[]>;
//   markAsRead(inquiryId: string):        Promise<IInquiry | null>;
// }

export interface IInquiryRepository extends IBaseRepository<IInquiry> {
  createInquiry(data: Partial<IInquiry>):   Promise<IInquiry>;
  findByLandlordId(landlordId: string):     Promise<IInquiry[]>;
  buildSearchQuery(
     landlordId: string,
     search:     string,
   ): Promise<FilterQuery<IInquiry>>
 findByLandlordIdPaginated(
    landlordId: string,
    skip:       number,
    limit:      number,
    search:     string,
  ): Promise<IInquiry[]>
  countByLandlordId(
    landlordId: string,
    search:     string,
  ): Promise<number>
}