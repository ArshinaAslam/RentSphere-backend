import type { IBaseRepository } from "../../../common/repository/IBaseRepository";
import type { IAdmin } from "../../../models/adminModel";

export interface IAdminRepository extends IBaseRepository<IAdmin> {
  findByEmail(email: string): Promise<IAdmin | null>;
}
