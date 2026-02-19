import { ITenantRepository } from "../repositories/interface/tenant/ITenantRepository";
import { ILandlordRepository } from "../repositories/interface/landlord/ILandlordRepository";
import { IAdminRepository } from "../repositories/interface/admin/IAdminReposiory";

export type IUserRepoMap = {
  TENANT: ITenantRepository;
  LANDLORD: ILandlordRepository;
//   ADMIN: IAdminRepository;
};