import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import {
  getKycStatusDto,
  KycFiles,
  SubmitLandlordKycDto,
} from "../../dto/auth/auth.dto";
import { ILandlordKycService } from "../../services/interface/landlord/ILandlordKycService";

@injectable()
export class LandlordKycController {
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
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.KYC.KYC_EMAIL_REQUIRED));
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
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.KYC.KYC_FILES_REQUIRED));
    }

    const result = await this._landlordKycService.submitKyc(email, dto);

    return res.status(HttpStatus.CREATED).json(
      ApiResponses.success(
        {
          kycId: result.kycId,
          kycStatus: result.kycStatus,
        },
        MESSAGES.KYC.KYC_SUBMITTED_SUCCESS,
      ),
    );
  }

  async getKycStatus(req: Request, res: Response): Promise<Response> {
    const dto = req.query as unknown as getKycStatusDto;

    if (!dto.email) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.KYC.KYC_EMAIL_QUERY_REQUIRED));
    }

    const result = await this._landlordKycService.getKycStatus(dto);

    return res.status(HttpStatus.OK).json(
      ApiResponses.success(
        {
          kycId: result.kycId,
          kycStatus: result.kycStatus,
          kycRejectedReason: result.kycRejectedReason,
        },
        MESSAGES.KYC.KYC_STATUS_FETCH_SUCCESS,
      ),
    );
  }
}
