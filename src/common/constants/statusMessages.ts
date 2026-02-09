
export const MESSAGES = {
  AUTH: {
    TENANT_SIGNUP_SUCCESS: "Tenant signup successful",
    EMAIL_EXISTS: 'Email already exists',
    SIGNUP_SUCCESS: 'User created successfully',
    SIGNUP_FAILED: "Signup failed",
    USER_NOT_FOUND: "User not found",
    EMAIL_VERIFIED: "Email verified.",
    PASSWORD_RESET_SUCCESS:"Password reset successfully"

  },
   USERS: {
    FETCH_SUCCESS: 'Users fetched successfully',
    STATUS_UPDATE_SUCCESS: 'User status updated successfully',
  },
  COMMON: {
    INTERNAL_SERVER_ERROR: "Something went wrong",
  },
}as const;
