import type { ILandlordRepository } from "../repositories/interface/landlord/ILandlordRepository";
import type { ITenantRepository } from "../repositories/interface/tenant/ITenantRepository";

export type IUserRepoMap = {
  TENANT: ITenantRepository;
  LANDLORD: ILandlordRepository;
  //   ADMIN: IAdminRepository;
};
