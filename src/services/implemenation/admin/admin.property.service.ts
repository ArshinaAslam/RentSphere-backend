import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { IPropertyRepository } from "../../../repositories/interface/IPropertyRepository";
import { IAdminPropertyService } from "../../interface/admin/IAdminPropertyService";

import type {
  GetAdminPropertiesDto,
  PaginatedAdminPropertiesDto,
} from "../../../dto/admin/admin.property.dto";

@injectable()
export default class AdminPropertyService implements IAdminPropertyService {
  constructor(
    @inject(DI_TYPES.PropertyRepository)
    private readonly _propertyRepo: IPropertyRepository,
  ) {}

  async getProperties(
    raw: GetAdminPropertiesDto,
  ): Promise<PaginatedAdminPropertiesDto> {
    const page = raw.page || 1;
    const limit = raw.limit || 5;

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      this._propertyRepo.findAllForAdmin({
        skip,
        limit,
        ...(raw.from && { from: raw.from }),
        ...(raw.to && { to: raw.to }),
      }),
      this._propertyRepo.countAllForAdmin({
        ...(raw.from && { from: raw.from }),
        ...(raw.to && { to: raw.to }),
      }),
    ]);

    return { properties, total, page, totalPages: Math.ceil(total / limit) };
  }
}
