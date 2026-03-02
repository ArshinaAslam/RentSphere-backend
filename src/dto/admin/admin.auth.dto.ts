// export interface AdminLoginDto {
//   email: string;
//   password: string;
// }

import type { AdminResponse } from "../../types/admin.types";

export interface AdminLoginDto {
  email: string;
  password: string;
  role: "ADMIN";
}

export interface AdminResponseDto {
  user: AdminResponse;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
