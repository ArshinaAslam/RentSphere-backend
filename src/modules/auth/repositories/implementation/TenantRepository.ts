

// import { BaseRepository } from "../../../../common/repository/BaseRepository";
// import { ITenant, TenantModel } from "../../../../models/tenantModel";
// import { ITenantRepository } from "../interface/ITenantRepository";
// import { injectable } from "tsyringe";


// @injectable()
// export class TenantRepository
//   extends BaseRepository<ITenant>
//   implements ITenantRepository
// {
//   constructor() {
//     super(TenantModel);
//   }

//   async findByEmail(email: string): Promise<ITenant | null> {
//     return this.findOne({ email });
//   }


//   async updateByEmail(email:string,updateData:Partial<ITenant>):Promise<ITenant | null>{

//     const user = await this.findByEmail(email)
//     if(!user)return null
//     return  this.update(user._id.toString(),updateData)
//   }



 
// }


