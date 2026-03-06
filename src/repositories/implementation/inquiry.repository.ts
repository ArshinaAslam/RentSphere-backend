import mongoose from "mongoose";
import { injectable } from "tsyringe";


import { BaseRepository } from "../../common/repository/BaseRepository";
import InquiryModel from "../../models/inquiryModel";

import type { IInquiry } from "../../models/inquiryModel";
import type { IInquiryRepository } from "../interface/IInquiryRepository";
import type { FilterQuery } from "mongoose";

@injectable()
export class InquiryRepository
  extends BaseRepository<IInquiry>
  implements IInquiryRepository
{
  constructor() {
    super(InquiryModel);
  }

  async createInquiry(data: Partial<IInquiry>): Promise<IInquiry> {
    return this.create(data);
  }

  async findByLandlordId(landlordId: string): Promise<IInquiry[]> {
    return this.model
      .find({ landlordId } as FilterQuery<IInquiry>)
      .populate("propertyId", "title address city images")
      .populate("tenantId",   "firstName lastName email phone avatar")
      .sort({ createdAt: -1 })
      .exec();
  }

  
  //  async buildSearchQuery(
  //   landlordId: string,
  //   search:     string,
  // ): Promise<FilterQuery<IInquiry>> {
  //   const query: FilterQuery<IInquiry> = { landlordId };

  //   if (search) {
  //     const [matchingTenants, matchingProperties] = await Promise.all([
  //       mongoose
  //         .model("Tenant")
  //         .find({
  //           $or: [
  //             { firstName: { $regex: search, $options: "i" } },
  //             { lastName:  { $regex: search, $options: "i" } },
  //             { email:     { $regex: search, $options: "i" } },
  //           ],
  //         })
  //         .select("_id")
  //         .exec(),

  //       mongoose
  //         .model("Property")
  //         .find({ title: { $regex: search, $options: "i" } })
  //         .select("_id")
  //         .exec(),
  //     ]);

  //     const tenantIds = matchingTenants.map((t) => t._id);
  //     const propertyIds = matchingProperties.map(p => p._id);

  //     query.$or = [
  //       { tenantId: { $in: tenantIds } },
  //       { propertyId: { $in: propertyIds } },
  //     ];
  //   }

  //   return query;
  // }

  async buildSearchQuery(landlordId: string, search: string): Promise<FilterQuery<IInquiry>> {
  const query: FilterQuery<IInquiry> = { landlordId };

  if (search) {
    const [matchingTenants, matchingProperties] = await Promise.all([
      mongoose.model("User")  
        .find({
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName:  { $regex: search, $options: "i" } },
            { email:     { $regex: search, $options: "i" } },
          ],
        })
        .select("_id")
        .exec(),

      mongoose.model("Property") 
        .find({ title: { $regex: search, $options: "i" } })
        .select("_id")
        .exec(),
    ]);

    

    const tenantIds   = matchingTenants.map(t => t._id);
    const propertyIds = matchingProperties.map(p => p._id);

    query.$or = [
      { tenantId:   { $in: tenantIds   } },
      { propertyId: { $in: propertyIds } },
    ];
  }

  return query;
}

  async findByLandlordIdPaginated(
    landlordId: string,
    skip:       number,
    limit:      number,
    search:     string,
  ): Promise<IInquiry[]> {
    const query = await this.buildSearchQuery(landlordId, search);

    return this.model
      .find(query)
      .populate("propertyId", "title address city images")
      .populate("tenantId",   "firstName lastName email phone avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countByLandlordId(
    landlordId: string,
    search:     string,
  ): Promise<number> {
    const query = await this.buildSearchQuery(landlordId, search);
    return this.model.countDocuments(query).exec();
  }

  async countUnreadStatus(
    landlordId:string
  ):Promise<Number>{
    return this.countDocuments({landlordId,status:"unread"})
  }
}