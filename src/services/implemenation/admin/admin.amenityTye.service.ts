import { Types } from "mongoose";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { AmenityMapper } from "../../../mappers/amenity.mapper";
import { IAmenityRepository } from "../../../repositories/interface/IAmenityRepository";
import logger from "../../../utils/logger";
import { IAdminAmenityService } from "../../interface/admin/IAdminAmenityService";

import type {
  AddAmenityDto,
  AmenityResultDto,
  GetAmenitiesQuery,
  PaginatedAmenitiesDto,
} from "../../../dto/admin/admin.amenity-type.dto";

@injectable()
export default class AdminAmenityService implements IAdminAmenityService {
  constructor(
    @inject(DI_TYPES.AmenityRepository)
    private readonly _amenityRepo: IAmenityRepository,
  ) {}

  async getAmenities(query: GetAmenitiesQuery): Promise<PaginatedAmenitiesDto> {
    const { page, limit, search = "" } = query;
    const skip = (page - 1) * limit;

    const [amenities, total] = await Promise.all([
      this._amenityRepo.findPaginated(skip, limit, search),
      this._amenityRepo.countByFilter(search),
    ]);

    return {
      data: AmenityMapper.toDtoList(amenities),
      total,
      page,
      limit,
    };
  }

  async addAmenity(dto: AddAmenityDto): Promise<AmenityResultDto> {
    logger.info("Adding new amenity", { label: dto.label });

    if (!dto.label?.trim()) {
      throw new AppError(
        MESSAGES.AMENITY.LABEL_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!dto.emoji?.trim()) {
      throw new AppError(
        MESSAGES.AMENITY.EMOJI_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this._amenityRepo.findByLabel(dto.label.trim());
    if (existing) {
      throw new AppError(MESSAGES.AMENITY.ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    const created = await this._amenityRepo.createAmenity({
      label: dto.label.trim(),
      emoji: dto.emoji.trim(),
    });

    logger.info("Amenity created", { amenityId: String(created._id) });
    return AmenityMapper.toDto(created);
  }

  async toggleAmenity(amenityId: string): Promise<AmenityResultDto> {
    logger.info("Toggling amenity status", { amenityId });

    if (!Types.ObjectId.isValid(amenityId)) {
      throw new AppError(MESSAGES.AMENITY.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    const existing = await this._amenityRepo.findById(amenityId);
    if (!existing) {
      throw new AppError(MESSAGES.AMENITY.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updated = await this._amenityRepo.updateById(amenityId, {
      isActive: !existing.isActive,
    });

    if (!updated) {
      throw new AppError(
        MESSAGES.AMENITY.UPDATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info("Amenity toggled", { amenityId, isActive: updated.isActive });
    return AmenityMapper.toDto(updated);
  }

  async deleteAmenity(amenityId: string): Promise<void> {
    logger.info("Deleting amenity", { amenityId });

    if (!Types.ObjectId.isValid(amenityId)) {
      throw new AppError(MESSAGES.AMENITY.INVALID_ID, HttpStatus.BAD_REQUEST);
    }

    const existing = await this._amenityRepo.findById(amenityId);
    if (!existing) {
      throw new AppError(MESSAGES.AMENITY.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    await this._amenityRepo.deleteById(amenityId);

    logger.info("Amenity deleted", { amenityId });
  }
}
