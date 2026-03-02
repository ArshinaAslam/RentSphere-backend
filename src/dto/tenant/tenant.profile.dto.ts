export interface editTenantProfileDto {
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
}

export interface changePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserProfileDto {
  id: string;
  email: string;
  role: string;
  fullName: string;
  avatar?: string;
  phone: string;
}
