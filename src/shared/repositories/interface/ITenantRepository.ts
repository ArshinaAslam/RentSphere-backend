import type { FilterQuery,Query } from "mongoose";
import { ITenant } from '../../../models/tenantModel';
import { IBaseRepository } from "../../../common/repository/IBaseRepository";

export interface ITenantRepository extends IBaseRepository<ITenant>{

  findByEmail(email: string): Promise<ITenant | null>;
  updateByEmail(email:string,updateData:Partial<ITenant>):Promise<ITenant | null>

 
  findMany(filter: FilterQuery<ITenant>): Query<ITenant[], ITenant>;
  count(filter: FilterQuery<ITenant>): Promise<number>;
  updateUserById(id:string,updateData:Partial<ITenant>):Promise<ITenant | null>
}
