import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import { AdminModel, IAdmin } from "../../models/adminModel";
import { IAdminRepository } from "../../repositories/interface/IAdminReposiory";

@injectable()
export class AdminRepository
  extends BaseRepository<IAdmin>
  implements IAdminRepository
{
  constructor() {
    super(AdminModel);
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    return this.findOne({ email });
  }
}
