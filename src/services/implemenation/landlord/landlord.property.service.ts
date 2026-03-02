// import { injectable, inject } from "tsyringe";

// import { DI_TYPES } from "../../../common/di/types";
// import { HttpStatus } from "../../../common/enums/httpStatus.enum";
// import { AppError } from "../../../common/errors/appError";
// import { uploadToS3 } from "../../../config/s3";
// import {
//   AddPropertyDto,
//   EditPropertyDto,
// } from "../../../dto/landlord/landlord.property.dto";
// import { IPropertyRepository } from "../../../repositories/interface/IPropertyRepository";
// import { ILandlordRepository } from "../../../repositories/interface/landlord/ILandlordRepository";
// import logger from "../../../utils/logger";
// import {
//   GetPropertiesResult,
//   GetPropertyResult,
//   ILandlordPropertyService,
//   PropertyResult,
// } from "../../interface/landlord/ILandlordPropertyService";

// @injectable()
// export class LandlordPropertyService implements ILandlordPropertyService {
//   constructor(
//     @inject(DI_TYPES.LandlordRepository)
//     private readonly _landlordRepo: ILandlordRepository,
//     @inject(DI_TYPES.PropertyRepository)
//     private readonly _propertyRepo: IPropertyRepository,
//   ) {}

//   async addProperty(
//     dto: AddPropertyDto,
//     imageFiles: Express.Multer.File[],
//   ): Promise<PropertyResult> {
//     if (!dto.landlordId) {
//       throw new AppError("landlordId is required", HttpStatus.BAD_REQUEST);
//     }

//     const landlordId = dto.landlordId;

//     const landlord = await this._landlordRepo.findById(landlordId);
//     if (!landlord) {
//       throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
//     }
//     if (landlord.kycStatus !== "APPROVED") {
//       throw new AppError(
//         "KYC not approved. Cannot list properties",
//         HttpStatus.FORBIDDEN,
//       );
//     }

//     const imageUrls = await Promise.all(
//       imageFiles.map(async (file, index) => {
//         const key = `properties/${landlordId}/${Date.now()}-${index}-${file.originalname}`;
//         return uploadToS3(file, key, landlordId);
//       }),
//     );

//     const propertyData = {
//       title: dto.title,
//       type: dto.type,
//       bhk: dto.bhk,
//       address: dto.address,
//       city: dto.city,
//       state: dto.state,
//       pincode: dto.pincode,
//       price: dto.price,
//       securityDeposit: dto.securityDeposit,
//       vacant: dto.vacant,
//       status: dto.status,
//       bedrooms: dto.bedrooms,
//       bathrooms: dto.bathrooms,
//       area: dto.area,
//       furnishing: dto.furnishing,
//       description: dto.description,
//       amenities: dto.amenities,
//       images: imageUrls,
//       landlordId: landlordId,
//     };

//     const property = await this._propertyRepo.createProperty(propertyData);
//     if (!property) {
//       throw new AppError(
//         "Failed to create property",
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }

//     logger.info("Property created successfully", {
//       propertyId: property._id,
//       imageCount: imageUrls.length,
//       landlordId,
//     });

//     return {
//       propertyId: property._id.toString(),

//       property: property,
//     };
//   }

//   async getLandlordProperties(
//     landlordId: string,
//     page: number = 1,
//     limit: number = 6,
//     search: string = "",
//   ): Promise<GetPropertiesResult> {
//     const landlord = await this._landlordRepo.findById(landlordId);
//     if (!landlord || landlord.kycStatus !== "APPROVED") {
//       throw new AppError(
//         "Landlord not found or KYC not approved",
//         HttpStatus.FORBIDDEN,
//       );
//     }

//     const skip = (page - 1) * limit;
//     const properties = await this._propertyRepo.findByLandlordId(
//       landlordId,
//       skip,
//       limit,
//       search,
//     );
//     const total = await this._propertyRepo.countByLandlordId(
//       landlordId,
//       search,
//     );

//     logger.info("Landlord properties fetched", {
//       landlordId,
//       page,
//       limit,
//       count: properties.length,
//     });

//     return {
//       properties,
//       total,
//       page,
//       limit,
//     };
//   }

//   async getPropertyById(
//     propertyId: string,
//     landlordId: string,
//   ): Promise<GetPropertyResult> {
//     const property = await this._propertyRepo.findPropertyById(propertyId);

//     if (!property) {
//       throw new AppError("Property not found", HttpStatus.NOT_FOUND);
//     }

//     if (property.landlordId.toString() !== landlordId) {
//       throw new AppError(
//         "Unauthorized access to property",
//         HttpStatus.FORBIDDEN,
//       );
//     }

//     logger.info("Single property fetched", { propertyId, landlordId });

//     return { property };
//   }

//   async deletePropertyById(
//     propertyId: string,
//     landlordId: string,
//   ): Promise<void> {
//     const property = await this._propertyRepo.findPropertyById(propertyId);

//     if (!property) {
//       throw new AppError("Property not found", HttpStatus.NOT_FOUND);
//     }

//     if (property.landlordId.toString() !== landlordId) {
//       throw new AppError(
//         "Unauthorized access to property",
//         HttpStatus.FORBIDDEN,
//       );
//     }

//     await this._propertyRepo.deletePropertyById(propertyId);

//     logger.info("Property deleted", { propertyId, landlordId });
//   }

//   async editLandlordProperty(
//     dto: EditPropertyDto,
//     propertyId: string,
//     landlordId: string,
//     imageFiles: Express.Multer.File[] = [],
//   ): Promise<PropertyResult> {
//     const existingProperty = await this._propertyRepo.findById(propertyId);
//     if (!existingProperty) {
//       throw new AppError("Property not found", HttpStatus.NOT_FOUND);
//     }

//     if (existingProperty.landlordId.toString() !== landlordId) {
//       throw new AppError(
//         "Unauthorized: You can only edit your own properties",
//         HttpStatus.FORBIDDEN,
//       );
//     }

//     const landlord = await this._landlordRepo.findById(landlordId);
//     if (!landlord) {
//       throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
//     }

//     let imageUrls: string[] = [];

//     if (dto.existingImages) {
//       const parsed =
//         typeof dto.existingImages === "string"
//           ? JSON.parse(dto.existingImages)
//           : dto.existingImages;

//       imageUrls = Array.isArray(parsed)
//         ? parsed.filter(
//             (url): url is string => Boolean(url) && Boolean(url.trim()),
//           )
//         : [];
//     } else {
//       imageUrls = existingProperty.images || [];
//     }

//     if (imageFiles.length > 0) {
//       const newImageUrls = await Promise.all(
//         imageFiles.map(async (file, index) => {
//           const key = `properties/${landlordId}/${Date.now()}-${index}-${file.originalname}`;
//           return uploadToS3(file, key, landlordId);
//         }),
//       );
//       imageUrls = [...imageUrls, ...newImageUrls];
//     }

//     const propertyData = {
//       title: dto.title,
//       type: dto.type,
//       bhk: dto.bhk,
//       address: dto.address,
//       city: dto.city,
//       state: dto.state,
//       pincode: dto.pincode,
//       price: dto.price,
//       securityDeposit: dto.securityDeposit,
//       vacant: dto.vacant,
//       status: dto.status,
//       bedrooms: dto.bedrooms,
//       bathrooms: dto.bathrooms,
//       area: dto.area,
//       furnishing: dto.furnishing,
//       description: dto.description,
//       amenities: dto.amenities,
//       images: imageUrls,
//       landlordId: landlordId,
//     };

//     const property = await this._propertyRepo.updateProperty(
//       propertyId,
//       propertyData,
//     );

//     if (!property) {
//       throw new AppError(
//         "Failed to update property",
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }

//     logger.info("Property updated successfully", {
//       propertyId: property._id,
//       imageCount: imageUrls.length,
//       landlordId,
//     });

//     return {
//       propertyId: property._id.toString(),
//       property: property,
//     };
//   }
// }

import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { uploadToS3 } from "../../../config/s3";
import {
  AddPropertyDto,
  EditPropertyDto,
  GetPropertiesResultDto,
  GetPropertyResultDto,
  PropertyResultDto,
} from "../../../dto/landlord/landlord.property.dto";
import { PropertyMapper } from "../../../mappers/property.mapper";
import { IPropertyRepository } from "../../../repositories/interface/IPropertyRepository";
import { ILandlordRepository } from "../../../repositories/interface/landlord/ILandlordRepository";
import logger from "../../../utils/logger";
import { ILandlordPropertyService } from "../../interface/landlord/ILandlordPropertyService";

@injectable()
export class LandlordPropertyService implements ILandlordPropertyService {
  constructor(
    @inject(DI_TYPES.LandlordRepository)
    private readonly _landlordRepo: ILandlordRepository,
    @inject(DI_TYPES.PropertyRepository)
    private readonly _propertyRepo: IPropertyRepository,
  ) {}

  async addProperty(
    dto: AddPropertyDto,
    imageFiles: Express.Multer.File[],
  ): Promise<PropertyResultDto> {
    if (!dto.landlordId) {
      throw new AppError("landlordId is required", HttpStatus.BAD_REQUEST);
    }

    if (imageFiles.length === 0) {
      throw new AppError(
        "At least 1 property image required",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (imageFiles.length > 10) {
      throw new AppError("Maximum 10 images allowed", HttpStatus.BAD_REQUEST);
    }

    if (!dto.title || !dto.type || !dto.price) {
      throw new AppError(
        "Title, type, and price required",
        HttpStatus.BAD_REQUEST,
      );
    }

    const landlordId = dto.landlordId;

    const landlord = await this._landlordRepo.findById(landlordId);
    if (!landlord) {
      throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
    }
    if (landlord.kycStatus !== "APPROVED") {
      throw new AppError(
        "KYC not approved. Cannot list properties",
        HttpStatus.FORBIDDEN,
      );
    }

    const imageUrls = await Promise.all(
      imageFiles.map(async (file, index) => {
        const key = `properties/${landlordId}/${Date.now()}-${index}-${file.originalname}`;
        return uploadToS3(file, key, landlordId);
      }),
    );

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
    });

    if (!property) {
      throw new AppError(
        "Failed to create property",
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
    limit: number = 6,
    search: string = "",
  ): Promise<GetPropertiesResultDto> {
    const landlord = await this._landlordRepo.findById(landlordId);
    if (!landlord || landlord.kycStatus !== "APPROVED") {
      throw new AppError(
        "Landlord not found or KYC not approved",
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
      throw new AppError("Property not found", HttpStatus.NOT_FOUND);
    }

    if (property.landlordId.toString() !== landlordId) {
      throw new AppError(
        "Unauthorized access to property",
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
      throw new AppError("Property not found", HttpStatus.NOT_FOUND);
    }

    if (property.landlordId.toString() !== landlordId) {
      throw new AppError(
        "Unauthorized access to property",
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
      throw new AppError("Property not found", HttpStatus.NOT_FOUND);
    }

    if (existingProperty.landlordId.toString() !== landlordId) {
      throw new AppError(
        "Unauthorized: You can only edit your own properties",
        HttpStatus.FORBIDDEN,
      );
    }

    const landlord = await this._landlordRepo.findById(landlordId);
    if (!landlord) {
      throw new AppError("Landlord not found", HttpStatus.NOT_FOUND);
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
    });

    if (!property) {
      throw new AppError(
        "Failed to update property",
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
}
