import { injectable } from 'tsyringe';


import { AdminModel, IAdmin } from '../../../models/adminModel'




import { BaseRepository } from "../../../common/repository/BaseRepository";


import { IAdminRepository } from '../../../repositories/interface/admin/IAdminReposiory';


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
