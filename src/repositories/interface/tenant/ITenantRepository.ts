import type { IBaseRepository } from "../../../common/repository/IBaseRepository";
import type { ITenant } from "../../../models/tenantModel";
import type { FilterQuery, Query } from "mongoose";

export interface ITenantRepository extends IBaseRepository<ITenant> {
  findByEmail(email: string): Promise<ITenant | null>;
  updateByEmail(
    email: string,
    updateData: Partial<ITenant>,
  ): Promise<ITenant | null>;

  findMany(filter: FilterQuery<ITenant>): Query<ITenant[], ITenant>;
  count(filter: FilterQuery<ITenant>): Promise<number>;
  updateUserById(
    id: string,
    updateData: Partial<ITenant>,
  ): Promise<ITenant | null>;
}
