import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { uploadToS3 } from "../../../config/s3";
import {
  getKycStatusDto,
  SubmitLandlordKycDto,
} from "../../../dto/landlord/landlord.kyc.dto";
import { ILandlord } from "../../../models/landlordModel";
import { ILandlordRepository } from "../../../repositories/interface/landlord/ILandlordRepository";
import logger from "../../../utils/logger";
import {
  ILandlordKycService,
  KycResult,
} from "../../interface/landlord/ILandlordKycService";

function validateAadhaar(number: string): void {
  if (!/^\d{12}$/.test(number)) {
    throw new AppError("Invalid Aadhaar format", 400);
  }
}

function validatePan(number: string): void {
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(number)) {
    throw new AppError("Invalid PAN format", 400);
  }
}

@injectable()
export class LandlordKycService implements ILandlordKycService {
  constructor(
    @inject(DI_TYPES.LandlordRepository)
    private readonly _landlordRepo: ILandlordRepository,
  ) {}

  async submitKyc(
    email: string,
    dto: SubmitLandlordKycDto,
  ): Promise<KycResult> {
    const user = await this._landlordRepo.findByEmail(email);
    if (!user) {
      throw new AppError(
        "Landlord not found for this email",
        HttpStatus.NOT_FOUND,
      );
    }

    const userId = String(user._id);

    const { aadhaarFront, panCard, aadhaarBack, selfie } = dto.files;

    if (!aadhaarFront || !panCard) {
      throw new AppError("Required documents missing", HttpStatus.BAD_REQUEST);
    }

    const [aadhaarFrontUrl, panCardUrl, aadhaarBackUrl, selfieUrl] =
      await Promise.all([
        uploadToS3(aadhaarFront, "kyc/aadhaar", userId),
        uploadToS3(panCard, "kyc/pan", userId),
        aadhaarBack
          ? uploadToS3(aadhaarBack, "kyc/aadhaar", userId)
          : Promise.resolve(""),
        selfie ? uploadToS3(selfie, "kyc/selfie", userId) : Promise.resolve(""),
      ]);

    validateAadhaar(dto.aadhaarNumber);
    validatePan(dto.panNumber);

    const dbData: Partial<ILandlord> = {
      kycStatus: "PENDING",
      kycDetails: {
        aadhaarNumber: dto.aadhaarNumber,
        panNumber: dto.panNumber,
      },
      kycDocuments: {
        aadhaarFront: aadhaarFrontUrl,
        aadhaarBack: aadhaarBackUrl || "",
        panCard: panCardUrl,
        liveSelfie: selfieUrl || "",
      },
      kycSubmittedAt: new Date(),
    };

    const landlord = await this._landlordRepo.updateKyc(userId, dbData);
    if (!landlord) throw new AppError("Landlord not found", 404);

    return {
      kycId: String(landlord._id),
      kycStatus: landlord.kycStatus ?? "PENDING",
      kycRejectedReason: landlord.kycRejectedReason || null,
    };
  }

  async getKycStatus(dto: getKycStatusDto): Promise<KycResult> {
    logger.info("Fetching KYC status for email", { email: dto.email });

    const landlord = await this._landlordRepo.findByEmail(dto.email);
    if (!landlord) {
      logger.warn("KYC status failed - landlord not found", {
        email: dto.email,
      });
      throw new AppError(
        "Landlord not found for this email",
        HttpStatus.NOT_FOUND,
      );
    }

    logger.debug("KYC status found", {
      email: dto.email,
      kycId: String(landlord._id),
      kycStatus: landlord.kycStatus || "PENDING",
    });

    const result = {
      kycId: String(landlord._id),
      kycStatus:
        (landlord.kycStatus as "PENDING" | "APPROVED" | "REJECTED") ||
        "PENDING",
      kycRejectedReason: landlord.kycRejectedReason || null,
    };

    logger.info("KYC status returned successfully", {
      kycId: result.kycId,
      kycStatus: result.kycStatus,
    });

    return result;
  }
}
