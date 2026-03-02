export type UserRole = "TENANT" | "LANDLORD";

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  fullName: string;
  phone: string;
  avatar?: string;
  // landlord only
  aadharNumber?: string;
  panNumber?: string;
  aadharFrontUrl?: string;
  aadharBackUrl?: string;
  panFrontUrl?: string;
}
