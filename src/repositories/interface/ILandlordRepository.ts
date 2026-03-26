import type { IBaseRepository } from "../../common/repository/IBaseRepository";
import type { ILandlord } from "../../models/landlordModel";
import type { FilterQuery, Query } from "mongoose";

export interface ILandlordRepository extends IBaseRepository<ILandlord> {
  findByEmail(email: string): Promise<ILandlord | null>;
  updateByEmail(
    email: string,
    updateData: Partial<ILandlord>,
  ): Promise<ILandlord | null>;
  updateKyc(
    userId: string,
    kycData: Partial<ILandlord>,
  ): Promise<ILandlord | null>;
  findMany(filter: FilterQuery<ILandlord>): Query<ILandlord[], ILandlord>;
  count(filter: FilterQuery<ILandlord>): Promise<number>;
  // findById(id: string): Promise<ILandlord | null>;
  updateLandlordById(
    id: string,
    updateData: Partial<ILandlord>,
  ): Promise<ILandlord | null>;
}
