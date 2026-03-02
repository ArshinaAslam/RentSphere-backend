import type {
  getKycStatusDto,
  SubmitLandlordKycDto,
} from "../../../dto/landlord/landlord.auth.dto";

export interface KycResult {
  kycId: string;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";
  kycRejectedReason?: string | null;
}

export interface ILandlordKycService {
  submitKyc(email: string, dto: SubmitLandlordKycDto): Promise<KycResult>;
  getKycStatus(dto: getKycStatusDto): Promise<KycResult>;
}
