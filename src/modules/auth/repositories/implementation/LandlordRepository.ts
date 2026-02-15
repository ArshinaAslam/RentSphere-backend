// // repositories/landlordRepository.ts
// import { BaseRepository } from "../../../../common/repository/BaseRepository";
// import { ILandlord, LandlordModel } from "../../../../models/landlordModel";
// import { ILandlordRepository } from "../interface/ILandlordRepository";
// import { injectable } from "tsyringe";

// @injectable()
// export class LandlordRepository
//   extends BaseRepository<ILandlord>
//   implements ILandlordRepository
// {
//   constructor() {
//     super(LandlordModel);
//   }

//   async findByEmail(email: string): Promise<ILandlord | null> {
//     return this.findOne({ email });
//   }

//   async updateByEmail(email: string, updateData: Partial<ILandlord>): Promise<ILandlord | null> {
//     const landlord = await this.findByEmail(email);
//     if (!landlord) return null;
//     return this.update(landlord._id.toString(), updateData);
//   }
// async updateKyc(userId: string, kycData: Partial<ILandlord>): Promise<ILandlord | null> {
//   return this.model
//     .findByIdAndUpdate(userId, kycData, { 
//       new: true  
//     })
//     .exec();
// }
  
// }
