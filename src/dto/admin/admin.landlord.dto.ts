export interface GetLandlordDetailsDto {
  id: string;
}

export interface LandlordListItemDto {
  id: string;
  //   tenantId: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | undefined;
  status: "active" | "blocked";
  kycStatus: string;
}

export interface LandlordListDto {
  users: LandlordListItemDto[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LandlordDetailsDto {
  id: string;
  //   landlordId: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  status: "active" | "blocked";
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  aadharNumber: string;
  panNumber: string;
  aadharFrontUrl: string;
  aadharBackUrl: string;
  panFrontUrl: string;
  liveSelfie?: string;
  kycRejectedReason?: string;
}
