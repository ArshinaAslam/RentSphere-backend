import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { uploadToS3 } from "../../../config/s3";
import {
  AddPropertyDto,
  EditPropertyDto,
  GetPropertiesResultDto,
  GetPropertyLeasesDto,
  GetPropertyPaymentsDto,
  GetPropertyResultDto,
  GetPropertyReviewsDto,
  PropertyResultDto,
} from "../../../dto/landlord/landlord.property.dto";
import { ReviewResponseDto } from "../../../dto/tenant/tenant.review.dto";
import { LeaseMapper, LeaseResponseDto } from "../../../mappers/lease.mapper";
import {
  PaymentMapper,
  PaymentResponseDto,
} from "../../../mappers/payment.mapper";
import { PropertyMapper } from "../../../mappers/property.mapper";
import { ReviewMapper } from "../../../mappers/review.mapper";
import { ILandlordRepository } from "../../../repositories/interface/ILandlordRepository";
import { ILeaseRepository } from "../../../repositories/interface/ILeaseRepository";
import { IPaymentRepository } from "../../../repositories/interface/IPaymentRepository";
import { IPropertyRepository } from "../../../repositories/interface/IPropertyRepository";
import { IReviewRepository } from "../../../repositories/interface/IReviewRepository";
import { geocodeAddress } from "../../../utils/geocode";
import logger from "../../../utils/logger";
import { ILandlordPropertyService } from "../../interface/landlord/ILandlordPropertyService";

@injectable()
export class LandlordPropertyService implements ILandlordPropertyService {
  constructor(
    @inject(DI_TYPES.LandlordRepository)
    private readonly _landlordRepo: ILandlordRepository,
    @inject(DI_TYPES.PropertyRepository)
    private readonly _propertyRepo: IPropertyRepository,
    @inject(DI_TYPES.LeaseRepository)
    private readonly _leaseRepo: ILeaseRepository,
    @inject(DI_TYPES.PaymentRepository)
    private readonly _paymentRepo: IPaymentRepository,
    @inject(DI_TYPES.ReviewRepository)
    private readonly _reviewRepo: IReviewRepository,
  ) {}

  async addProperty(
    dto: AddPropertyDto,
    imageFiles: Express.Multer.File[],
  ): Promise<PropertyResultDto> {
    if (!dto.landlordId) {
      throw new AppError(
        MESSAGES.PROPERTY.LANDLORD_ID_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (imageFiles.length === 0) {
      throw new AppError(
        MESSAGES.PROPERTY.IMAGE_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (imageFiles.length > 10) {
      throw new AppError(MESSAGES.PROPERTY.MAX_IMAGES, HttpStatus.BAD_REQUEST);
    }

    if (!dto.title || !dto.type || !dto.price) {
      throw new AppError(
        MESSAGES.PROPERTY.REQUIRED_FIELDS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const landlordId = dto.landlordId;

    const landlord = await this._landlordRepo.findById(landlordId);
    if (!landlord) {
      throw new AppError(
        MESSAGES.PROPERTY.LANDLORD_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    if (landlord.kycStatus !== "APPROVED") {
      throw new AppError(
        MESSAGES.PROPERTY.KYC_NOT_APPROVED,
        HttpStatus.FORBIDDEN,
      );
    }

    const imageUrls = await Promise.all(
      imageFiles.map(async (file, index) => {
        const key = `properties/${landlordId}/${Date.now()}-${index}-${file.originalname}`;
        return uploadToS3(file, key, landlordId);
      }),
    );

    const coordinates: { lat: number; lng: number } | null =
      await geocodeAddress(dto.address, dto.city, dto.state, dto.pincode);

    if (coordinates) {
      logger.info("Property geocoded successfully", { coordinates });
    } else {
      logger.warn("Could not geocode property address", {
        address: dto.address,
        city: dto.city,
      });
    }

    const property = await this._propertyRepo.createProperty({
      title: dto.title,
      type: dto.type,
      bhk: dto.bhk,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      pincode: dto.pincode,
      price: dto.price,
      securityDeposit: dto.securityDeposit,
      vacant: dto.vacant,
      status: dto.status,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      area: dto.area,
      furnishing: dto.furnishing,
      description: dto.description,
      amenities: dto.amenities,
      images: imageUrls,
      landlordId: landlordId,
      ...(coordinates && { coordinates }),
    });

    if (!property) {
      throw new AppError(
        MESSAGES.PROPERTY.CREATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info("Property created successfully", {
      propertyId: String(property._id),
      imageCount: imageUrls.length,
      landlordId,
    });

    return {
      propertyId: String(property._id),
      property: PropertyMapper.toResponseDto(property),
    };
  }

  async getLandlordProperties(
    landlordId: string,
    page: number = 1,
    limit: number = 2,
    search: string = "",
  ): Promise<GetPropertiesResultDto> {
    const landlord = await this._landlordRepo.findById(landlordId);
    if (!landlord || landlord.kycStatus !== "APPROVED") {
      throw new AppError(
        MESSAGES.PROPERTY.LANDLORD_INVALID,
        HttpStatus.FORBIDDEN,
      );
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      this._propertyRepo.findByLandlordId(landlordId, skip, limit, search),
      this._propertyRepo.countByLandlordId(landlordId, search),
    ]);

    logger.info("Landlord properties fetched", {
      landlordId,
      page,
      limit,
      count: properties.length,
    });

    return {
      properties: PropertyMapper.toResponseDtoList(properties),
      total,
      page,
      limit,
    };
  }

  async getPropertyById(
    propertyId: string,
    landlordId: string,
  ): Promise<GetPropertyResultDto> {
    const property = await this._propertyRepo.findPropertyById(propertyId);

    if (!property) {
      throw new AppError(
        MESSAGES.PROPERTY.PROPERTY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (property.landlordId.toString() !== landlordId) {
      throw new AppError(
        MESSAGES.PROPERTY.UNAUTHORIZED_ACCESS,
        HttpStatus.FORBIDDEN,
      );
    }

    logger.info("Single property fetched", { propertyId, landlordId });

    return {
      property: PropertyMapper.toResponseDto(property),
    };
  }

  async deletePropertyById(
    propertyId: string,
    landlordId: string,
  ): Promise<void> {
    const property = await this._propertyRepo.findPropertyById(propertyId);

    if (!property) {
      throw new AppError(
        MESSAGES.PROPERTY.PROPERTY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (property.landlordId.toString() !== landlordId) {
      throw new AppError(
        MESSAGES.PROPERTY.UNAUTHORIZED_ACCESS,
        HttpStatus.FORBIDDEN,
      );
    }

    await this._propertyRepo.deletePropertyById(propertyId);

    logger.info("Property deleted", { propertyId, landlordId });
  }

  async editLandlordProperty(
    dto: EditPropertyDto,
    propertyId: string,
    landlordId: string,
    imageFiles: Express.Multer.File[] = [],
  ): Promise<PropertyResultDto> {
    const existingProperty = await this._propertyRepo.findById(propertyId);
    if (!existingProperty) {
      throw new AppError(
        MESSAGES.PROPERTY.PROPERTY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (existingProperty.landlordId.toString() !== landlordId) {
      throw new AppError(
        MESSAGES.PROPERTY.EDIT_UNAUTHORIZED,
        HttpStatus.FORBIDDEN,
      );
    }

    const landlord = await this._landlordRepo.findById(landlordId);
    if (!landlord) {
      throw new AppError(
        MESSAGES.PROPERTY.LANDLORD_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    let imageUrls: string[] = [];

    if (dto.existingImages) {
      const parsed: string[] =
        typeof dto.existingImages === "string"
          ? (JSON.parse(dto.existingImages) as string[])
          : (dto.existingImages ?? []);

      imageUrls = Array.isArray(parsed)
        ? parsed.filter(
            (url): url is string => Boolean(url) && Boolean(url.trim()),
          )
        : [];
    } else {
      imageUrls = existingProperty.images || [];
    }

    if (imageFiles.length > 0) {
      const newImageUrls = await Promise.all(
        imageFiles.map(async (file, index) => {
          const key = `properties/${landlordId}/${Date.now()}-${index}-${file.originalname}`;
          return uploadToS3(file, key, landlordId);
        }),
      );
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    const coordinates: { lat: number; lng: number } | null =
      await geocodeAddress(
        dto.address ?? existingProperty.address,
        dto.city ?? existingProperty.city,
        dto.state ?? existingProperty.state,
        dto.pincode ?? existingProperty.pincode,
      );

    if (coordinates) {
      logger.info("Property re-geocoded on edit", { coordinates });
    } else {
      logger.warn("Could not geocode on edit", { propertyId });
    }

    const property = await this._propertyRepo.updateProperty(propertyId, {
      title: dto.title,
      type: dto.type,
      bhk: dto.bhk,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      pincode: dto.pincode,
      price: dto.price,
      securityDeposit: dto.securityDeposit,
      vacant: dto.vacant,
      status: dto.status,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      area: dto.area,
      furnishing: dto.furnishing,
      description: dto.description,
      amenities: dto.amenities,
      images: imageUrls,
      landlordId: landlordId,
      ...(coordinates && { coordinates }),
    });

    if (!property) {
      throw new AppError(
        MESSAGES.PROPERTY.UPDATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info("Property updated successfully", {
      propertyId: String(property._id),
      imageCount: imageUrls.length,
      landlordId,
    });

    return {
      propertyId: String(property._id),
      property: PropertyMapper.toResponseDto(property),
    };
  }

  async getPropertyLeases(dto: GetPropertyLeasesDto): Promise<{
    leases: LeaseResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const property = await this._propertyRepo.findPropertyById(dto.propertyId);
    if (!property)
      throw new AppError(
        MESSAGES.PROPERTY.PROPERTY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    if (String(property.landlordId) !== dto.landlordId)
      throw new AppError(
        MESSAGES.PROPERTY.UNAUTHORIZED_ACCESS,
        HttpStatus.FORBIDDEN,
      );

    const { data, total } = await this._leaseRepo.findByPropertyId(
      dto.propertyId,
      dto.page,
      dto.limit,
      dto.status,
    );
    return {
      leases: LeaseMapper.toDtoList(data),
      total,
      page: dto.page,
      limit: dto.limit,
    };
  }

  async getPropertyPayments(dto: GetPropertyPaymentsDto): Promise<{
    payments: PaymentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const property = await this._propertyRepo.findPropertyById(dto.propertyId);
    if (!property)
      throw new AppError(
        MESSAGES.PROPERTY.PROPERTY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    if (String(property.landlordId) !== dto.landlordId)
      throw new AppError(
        MESSAGES.PROPERTY.UNAUTHORIZED_ACCESS,
        HttpStatus.FORBIDDEN,
      );
    const { data, total } = await this._paymentRepo.findByPropertyId(
      dto.propertyId,
      dto.page,
      dto.limit,
      dto.type,
      dto.status,
    );
    return {
      payments: PaymentMapper.toDtoList(data),
      total,
      page: dto.page,
      limit: dto.limit,
    };
  }

  async getPropertyReviews(dto: GetPropertyReviewsDto): Promise<{
    reviews: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const property = await this._propertyRepo.findPropertyById(dto.propertyId);
    if (!property)
      throw new AppError(
        MESSAGES.PROPERTY.PROPERTY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    if (String(property.landlordId) !== dto.landlordId)
      throw new AppError(
        MESSAGES.PROPERTY.UNAUTHORIZED_ACCESS,
        HttpStatus.FORBIDDEN,
      );

    const { data, total } = await this._reviewRepo.findByPropertyId(
      dto.propertyId,
      dto.page,
      dto.limit,
    );
    return {
      reviews: ReviewMapper.toResponseDtoList(data),
      total,
      page: dto.page,
      limit: dto.limit,
    };
  }
}
