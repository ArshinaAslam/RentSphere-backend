// // repositories/interface/ILandlordRepository.ts
// import { IBaseRepository } from "../../../../common/repository/IBaseRepository";
// import { ILandlord } from "../../../../models/landlordModel";

// export interface ILandlordRepository extends IBaseRepository<ILandlord> {
//   findByEmail(email: string): Promise<ILandlord | null>;
//   updateByEmail(email: string, updateData: Partial<ILandlord>): Promise<ILandlord | null>;
//   updateKyc(userId: string, kycData: Partial<ILandlord>): Promise<ILandlord | null>;
// }
