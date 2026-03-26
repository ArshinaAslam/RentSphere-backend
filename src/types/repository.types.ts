import type { ILandlordRepository } from "../repositories/interface/ILandlordRepository";
import type { ITenantRepository } from "../repositories/interface/ITenantRepository";

export type IUserRepoMap = {
  TENANT: ITenantRepository;
  LANDLORD: ILandlordRepository;
  //   ADMIN: IAdminRepository;
};
