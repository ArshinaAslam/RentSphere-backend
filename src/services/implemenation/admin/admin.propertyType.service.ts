import { Types } from "mongoose";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { PropertyTypeMapper } from "../../../mappers/propertyType.mapper";
import { IPropertyTypeRepository } from "../../../repositories/interface/IPropertyTypeRepository";
import logger from "../../../utils/logger";
import { IAdminPropertyTypeService } from "../../interface/admin/IAdminPropertyTypeService";

import type {
  AddPropertyTypeDto,
  GetPropertyTypesQuery,
  PaginatedPropertyTypesDto,
  PropertyTypeResultDto,
} from "../../../dto/admin/admin.property-type.dto";

@injectable()
export default class AdminPropertyTypeService implements IAdminPropertyTypeService {
  constructor(
    @inject(DI_TYPES.PropertyTypeRepository)
    private readonly _propertyTypeRepo: IPropertyTypeRepository,
  ) {}

  async getPropertyTypes(
    query: GetPropertyTypesQuery,
  ): Promise<PaginatedPropertyTypesDto> {
    const { page, limit, search = "" } = query;
    const skip = (page - 1) * limit;

    const [types, total] = await Promise.all([
      this._propertyTypeRepo.findPaginated(skip, limit, search),
      this._propertyTypeRepo.countByFilter(search),
    ]);

    logger.info(`Fetched ${types.length} property types`, {
      page,
      limit,
      total,
    });

    return {
      data: PropertyTypeMapper.toDtoList(types),
      total,
      page,
      limit,
    };
  }

  async addPropertyType(
    dto: AddPropertyTypeDto,
  ): Promise<PropertyTypeResultDto> {
    logger.info("Adding new property type", { name: dto.name });

    if (!dto.name?.trim()) {
      throw new AppError(
        MESSAGES.PROPERTY_TYPE.NAME_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this._propertyTypeRepo.findByName(dto.name.trim());
    if (existing) {
      throw new AppError(
        MESSAGES.PROPERTY_TYPE.ALREADY_EXISTS,
        HttpStatus.CONFLICT,
      );
    }

    const created = await this._propertyTypeRepo.createPropertyType({
      name: dto.name.trim(),
    });

    logger.info("Property type created");
    return PropertyTypeMapper.toDto(created);
  }

  async togglePropertyType(
    propertyTypeId: string,
  ): Promise<PropertyTypeResultDto> {
    logger.info("Toggling property type status", { propertyTypeId });

    if (!Types.ObjectId.isValid(propertyTypeId)) {
      throw new AppError(
        MESSAGES.PROPERTY_TYPE.INVALID_ID,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this._propertyTypeRepo.findById(propertyTypeId);
    if (!existing) {
      throw new AppError(
        MESSAGES.PROPERTY_TYPE.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    const updated = await this._propertyTypeRepo.updateById(propertyTypeId, {
      isActive: !existing.isActive,
    });

    if (!updated) {
      throw new AppError(
        MESSAGES.PROPERTY_TYPE.UPDATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info("Property type toggled");
    return PropertyTypeMapper.toDto(updated);
  }

  async deletePropertyType(propertyTypeId: string): Promise<void> {
    logger.info("Deleting property type", { propertyTypeId });

    if (!Types.ObjectId.isValid(propertyTypeId)) {
      throw new AppError(
        MESSAGES.PROPERTY_TYPE.INVALID_ID,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this._propertyTypeRepo.findById(propertyTypeId);
    if (!existing) {
      throw new AppError(
        MESSAGES.PROPERTY_TYPE.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    await this._propertyTypeRepo.deleteById(propertyTypeId);

    logger.info("Property type deleted");
  }
}
