import type { ActivePropertyTypesDto } from "../../../dto/landlord/landlord.property-type.dto";

export interface ILandlordPropertyTypeService {
  getActivePropertyTypes(): Promise<ActivePropertyTypesDto[]>;
}
