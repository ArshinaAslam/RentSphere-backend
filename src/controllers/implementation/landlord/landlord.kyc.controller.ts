import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";
import {
  getKycStatusDto,
  KycFiles,
  SubmitLandlordKycDto,
} from "../../../dto/auth/auth.dto";
import { ILandlordKycService } from "../../../services/interface/landlord/ILandlordKycService";
import logger from "../../../utils/logger";
import { ILandlordKycController } from "../../interface/landlord/ILandlordKycController";

@injectable()
export class LandlordKycController implements ILandlordKycController {
  constructor(
    @inject(DI_TYPES.LandlordKycService)
    private readonly _landlordKycService: ILandlordKycService,
  ) {}

  async submitLandlordKyc(req: Request, res: Response): Promise<Response> {
    const body = req.body as {
      email: string;
      aadhaarNumber: string;
      panNumber: string;
    };

    const email = body.email;
    if (!email) {
      return res.status(400).json(new ApiResponses(false, "Email required"));
    }

    const files = req.files as KycFiles;

    const dto: SubmitLandlordKycDto = {
      email,
      aadhaarNumber: body.aadhaarNumber,
      panNumber: body.panNumber,
      files: {
        aadhaarFront: files?.aadhaarFront?.[0] || null,
        aadhaarBack: files?.aadhaarBack?.[0] || null,
        panCard: files?.panCard?.[0] || null,
        selfie: files?.selfie?.[0] || null,
      },
    };

    if (!dto.files.aadhaarFront || !dto.files.panCard) {
      return res
        .status(400)
        .json(new ApiResponses(false, "Aadhaar front & PAN card required"));
    }

    const result = await this._landlordKycService.submitKyc(email, dto);

    return res.status(201).json(
      new ApiResponses(true, "KYC submitted successfully", {
        kycId: result.kycId,
        kycStatus: result.kycStatus,
      }),
    );
  }

  async getKycStatus(req: Request, res: Response): Promise<Response> {
    logger.info("KYC status request", {
      email: req.query.email,
    });

    const dto = req.query as unknown as getKycStatusDto;

    if (!dto.email) {
      logger.warn("KYC status failed - email missing");
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "Email required in query params"));
    }

    const result = await this._landlordKycService.getKycStatus(dto);

    logger.info("KYC status fetched SUCCESS", {
      email: dto.email,
      kycId: result.kycId,
      kycStatus: result.kycStatus,
    });

    return res.status(HttpStatus.OK).json(
      new ApiResponses(true, "KYC status fetched successfully", {
        data: {
          kycId: result.kycId,
          kycStatus: result.kycStatus,
          kycRejectedReason: result.kycRejectedReason,
          // kycSubmittedAt: result.kycSubmittedAt
        },
      }),
    );
  }
}
