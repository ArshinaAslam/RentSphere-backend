import type { IBaseRepository } from "../../common/repository/IBaseRepository";
import type { ITenant } from "../../models/tenantModel";
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

  searchByQuery(query: string, tenantIds: string[]): Promise<ITenant[]>;
  findPaginated(
    skip: number,
    limit: number,
    search: string,
    from?: string,
    to?: string,
  ): Promise<ITenant[]>;
  countBySearch(search?: string, from?: string, to?: string): Promise<number>;
}
