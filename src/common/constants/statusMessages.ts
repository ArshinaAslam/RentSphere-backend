export const MESSAGES = {
  AUTH: {
    EMAIL_EXISTS: "Email already exists",
    SIGNUP_SUCCESS: "User created successfully",
    SIGNUP_FAILED: "Signup failed",
    USER_NOT_FOUND: "User not found",
    EMAIL_VERIFIED: "Email verified.",
    PASSWORD_RESET_SUCCESS: "Password reset successfully",
    RESET_OTP_SENT: "Reset OTP sent to email",
    RESEND_OTP_SENT: "New OTP sent to your email",
    TOKEN_REFRESHED: "Token refreshed",
    LOGIN_SUCCES: "Logged in successfully",
    LOGOUT_SUCCESS: "Logged out successfully",
    REFRESH_TOKEN_REQUIRED: "Refresh token required",
    INVALID_GOOGLE_TOKEN: "Invalid Google token",
    GOOGLE_EMAIL_REQUIRED: "Google account must have an email associated",
    ROLE_CONFLICT: "Email already registered with different role",

    OTP_EXPIRED: "OTP expired",
    INVALID_OTP: "Invalid OTP",
    RESEND_LIMIT: "Please wait before requesting new OTP",
    LANDLORD_NOT_FOUND: "Landlord not found",
    NO_ACCOUNT_FOUND: "No account found with this email address",

    LOGIN_EMAIL_NOT_FOUND: "Email does not exist",
    EMAIL_NOT_VERIFIED: "Email is not verified",
    ACCOUNT_BLOCKED: "Account is blocked by admin",
    WRONG_PASSWORD: "Password is incorrect",

    PASSWORD_SAME: "New password cannot be the same as your old password",
    PASSWORD_MIN_LENGTH: "New password must be at least 8 characters",
    PASSWORD_UPPERCASE: "Password must contain at least one uppercase letter",
    PASSWORD_LOWERCASE: "Password must contain at least one lowercase letter",
    PASSWORD_NUMBER: "Password must contain at least one number",
    ACCOUNT_INACTIVE: "Your account is currently inactive",
  },
  USERS: {
    FETCH_SUCCESS: "Users fetched successfully",
    STATUS_UPDATE_SUCCESS: "User status updated successfully",
  },
  PROFILE: {
    PROFILE_UPDATE_SUCCESS: "Profile updated successfully",
    PASSWORD_CHANGE_SUCCESS: "Password changed successfully",
    USER_NOT_AUTHENTICATED: "User not authenticated",
    TENANT_NOT_FOUND: "Tenant not found",
    CURRENT_PASSWORD_INCORRECT: "Current password is incorrect",
    PASSWORD_MISMATCH: "New passwords do not match",
    PASSWORD_MIN_LENGTH: "New password must be at least 8 characters",
    LANDLORD_NOT_FOUND: "Landlord not found",
  },
  KYC: {
    KYC_EMAIL_REQUIRED: "Email required",
    KYC_FILES_REQUIRED: "Aadhaar front & PAN card required",
    KYC_SUBMITTED_SUCCESS: "KYC submitted successfully",
    KYC_STATUS_FETCH_SUCCESS: "KYC status fetched successfully",
    KYC_EMAIL_QUERY_REQUIRED: "Email required in query params",
    LANDLORD_NOT_FOUND: "Landlord not found for this email",
    REQUIRED_DOCS: "Required documents missing",

    INVALID_AADHAAR: "Invalid Aadhaar format",
    INVALID_PAN: "Invalid PAN format",
  },
  PROPERTY: {
    FETCH_ALL_SUCCESS: "Properties fetched successfully",
    FETCH_ONE_SUCCESS: "Property fetched successfully",
    INVALID_ID: "Invalid property ID",
    CREATE_SUCCESS: "Property listed successfully",
    DELETE_SUCCESS: "Property deleted successfully",
    UPDATE_SUCCESS: "Property updated successfully",

    UNAUTHORIZED: "User not authenticated",
    LANDLORD_UNAUTHORIZED: "Landlord not authenticated",
    EDIT_INVALID: "Property ID and authentication required",

    LANDLORD_ID_REQUIRED: "Landlord ID is required",
    IMAGE_REQUIRED: "At least 1 property image required",
    MAX_IMAGES: "Maximum 10 images allowed",
    REQUIRED_FIELDS: "Title, type, and price required",

    LANDLORD_NOT_FOUND: "Landlord not found",
    KYC_NOT_APPROVED: "KYC not approved. Cannot list properties",
    LANDLORD_INVALID: "Landlord not found or KYC not approved",

    CREATE_FAILED: "Failed to create property",
    UPDATE_FAILED: "Failed to update property",

    PROPERTY_NOT_FOUND: "Property not found",
    UNAUTHORIZED_ACCESS: "Unauthorized access to property",
    EDIT_UNAUTHORIZED: "Unauthorized: You can only edit your own properties",
  },
  LEASE: {
    UNAUTHORIZED: "Unauthorized",
    ID_REQUIRED: "Lease ID required",

    FETCH_ALL_SUCCESS: "Leases fetched successfully",
    FETCH_ONE_SUCCESS: "Lease fetched successfully",

    CREATE_SUCCESS: "Lease created successfully",
    UPDATE_SUCCESS: "Lease updated successfully",
    DELETE_SUCCESS: "Lease deleted successfully",

    SEND_SUCCESS: "Lease sent to tenant successfully",
    SIGN_SUCCESS: "Lease signed successfully",
    SIGN_LANDLORD_SUCCESS: "Lease signed by landlord — now active",

    TERMINATE_SUCCESS: "Lease terminated successfully",
    VIEWED_SUCCESS: "Lease marked as viewed",

    SEARCH_TOO_SHORT: "Search query too short",
    TENANTS_FOUND: "Tenants found",

    PROPERTIES_FETCH_SUCCESS: "Properties fetched successfully",
    NOT_FOUND: "Lease not found",

    INVALID_STATUS_SIGN: "Lease cannot be signed in its current status",
    ONLY_DRAFT_EDIT: "Only draft leases can be edited",
    ONLY_DRAFT_SEND: "Only draft leases can be sent",
    ONLY_DRAFT_DELETE: "Only draft leases can be deleted",

    TERMINATE_INVALID: "Only signed or active leases can be terminated",
    LANDLORD_SIGN_INVALID: "Landlord can only sign after tenant has signed",
  },
  INQUIRY: {
    UNAUTHORIZED: "User not authenticated",
    FETCH_SUCCESS: "Inquiries fetched successfully",
    CREATE_SUCCESS: "Inquiry submitted successfully",
    REQUIRED_IDS: "propertyId and landlordId are required",
    QUESTION_REQUIRED: "At least one question is required",
    INVALID_ID: "Inquiry ID is required",
    MARK_READ_SUCCESS: "Inquiry marked as read",
  },
  VISIT: {
    UNAUTHORIZED: "User not authenticated",

    FETCH_SUCCESS: "Visits fetched successfully",
    FETCH_REQUESTS_SUCCESS: "Visit requests fetched successfully",
    BOOKED_SLOTS_SUCCESS: "Booked slots fetched successfully",

    BOOK_SUCCESS: "Visit booked successfully",
    CANCEL_SUCCESS: "Visit cancelled successfully",
    UPDATE_STATUS_SUCCESS: "Visit status updated successfully",

    REQUIRED_FIELDS: "All booking fields are required",
    SLOT_REQUIRED: "Property ID and date are required",
    VISIT_ID_REQUIRED: "Visit ID is required",

    INVALID_STATUS: "Invalid status value",
    NOT_FOUND: "Visit not found",

    UNAUTHORIZED_VISIT: "Unauthorized: This is not your property visit",
    UNAUTHORIZED_BOOKING: "Unauthorized: This is not your booking",

    ALREADY_CANCELLED: "Visit is already cancelled",
    ALREADY_COMPLETED_UPDATE: "Cannot update a completed visit",
    ALREADY_COMPLETED_CANCEL: "Cannot cancel a completed visit",

    SLOT_ALREADY_BOOKED:
      "This time slot is already booked. Please choose another.",
    DUPLICATE_BOOKING:
      "You already have a visit booked for this property on this date.",

    REQUIRED_BOOKING_FIELDS:
      "propertyId, landlordId, date and timeSlot are required",
    REQUIRED_SLOT_FIELDS: "propertyId and date are required",
  },
  PAYMENT: {
    UNAUTHORIZED: "Unauthorized",

    FETCH_ALL: "Payments fetched",
    FETCH_ONE: "Payment fetched",
    FETCH_PROPERTY: "Property payments fetched",
    FETCH_LEASE: "Lease payments fetched",

    ORDER_CREATED: "Order created",
    RENT_ORDER_CREATED: "Rent order created",

    VERIFY_SUCCESS: "Payment verified successfully",

    PAYMENT_ID_REQUIRED: "Payment ID required",
    PROPERTY_ID_REQUIRED: "Property ID required",
    LEASE_ID_REQUIRED: "Lease ID required",
    NOT_FOUND: "Payment not found",
    RAZORPAY_SECRET_MISSING: "Razorpay secret key is not configured",
    LEASE_NOT_FOUND: "Lease not found",

    INVALID_SIGNATURE: "Invalid payment signature",

    DEPOSIT_ALREADY_PAID: "Deposit already paid for this lease",
    RENT_ALREADY_PAID: "Rent already paid for this month",

    LEASE_NOT_SIGNED: "Lease must be signed before paying deposit",
    LEASE_NOT_ACTIVE: "Lease must be active to pay rent",
  },

  WISHLIST: {
    ALREADY_EXISTS: "Property already in wishlist",

    ADD_SUCCESS: "Added to wishlist",
    REMOVE_SUCCESS: "Removed from wishlist",
    FETCH_SUCCESS: "Wishlist fetched",

    REQUIRED_FIELDS: "tenantId and propertyId required",
    TENANT_ID_REQUIRED: "tenantId required",
  },
  CHAT: {
    UNAUTHORIZED: "Unauthorized",
    USER_NOT_AUTHENTICATED: "User not authenticated",

    CONVERSATION_STARTED: "Conversation started",
    MESSAGE_SENT: "Message sent",
    CONVERSATIONS_FETCHED: "Conversations fetched",
    MESSAGES_FETCHED: "Messages fetched",
    MARKED_READ: "Marked as read",

    VOICE_UPLOADED: "Voice message uploaded",
    FILE_UPLOADED: "File uploaded",
    CALL_HISTORY: "Call history",

    NO_AUDIO: "No audio file provided",
    NO_FILE: "No file provided",

    CONVERSATION_NOT_FOUND: "Conversation not found",
  },
  NOTIFICATION: {
    UNAUTHORIZED: "Unauthorized",
    BAD_REQUEST: "Bad request",

    FETCH_SUCCESS: "Fetched",
    COUNT_SUCCESS: "Count",
    MARK_READ_SUCCESS: "Marked as read",
    MARK_ALL_READ_SUCCESS: "All marked as read",

    REQUIRED_FIELDS: "Missing required notification fields",
    RECIPIENT_REQUIRED: "Recipient ID required",
    MARK_REQUIRED: "Notification ID and recipient ID required",
  },
  ADMIN: {
    LOGIN_SUCCESS: "Admin login successful",

    INVALID_EMAIL: "Invalid Email",
    WRONG_PASSWORD: "Wrong Password",
    ACCOUNT_INACTIVE: "Account is inactive. Contact support.",

    UNAUTHORIZED: "Unauthorized",

    FETCH_LANDLORDS: "Landlords fetched successfully",
    FETCH_LANDLORD: "Landlord fetched successfully",

    LANDLORD_ID_REQUIRED: "Landlord id is required",
    INVALID_LANDLORD_ID: "Invalid landlord ID",

    USER_ID_REQUIRED: "User ID is required",

    STATUS_UPDATED: "User status updated successfully",

    KYC_APPROVED: "KYC approved successfully",
    KYC_REJECTED: "KYC rejected successfully",

    LANDLORD_NOT_FOUND: "Landlord not found",
    UPDATE_FAILED: "Failed to update landlord",
    INVALID_TENANT_ID_FORMAT: "Invalid tenantId format",
    INVALID_USER_ID: "Invalid user ID",

    INVALID_TENANT_ID: "Invalid tenant ID",
    TENANT_UPDATE_FAILED: "Failed to update tenant",
    TENANTS_FETCH_SUCCESS: "Tenants fetched successfully",
    TENANT_ID_REQUIRED: "Tenant ID is required",
  },
  REVIEW: {
    SUBMITTED: "Review submitted successfully",
    FETCHED: "Reviews fetched successfully",
    ALREADY_REVIEWED: "You have already reviewed this property",
    LEASE_NOT_ACTIVE: "You can only review a property with an active lease",
    NOT_YOUR_LEASE: "You are not authorized to review this property",
    UNAUTHORIZED: "User not authenticated",
    PROPERTY_ID_REQUIRED: "Property id required",
  },

  PROPERTY_TYPE: {
    FETCH_SUCCESS: "Property types fetched successfully",
    CREATED: "Property type created successfully",
    UPDATED: "Property type updated successfully",
    DELETED: "Property type deleted successfully",
    NOT_FOUND: "Property type not found",
    ALREADY_EXISTS: "Property type already exists",
    UPDATE_FAILED: "Property type update failed",
    INVALID_ID: "Invalid property type ID",
    ID_REQUIRED: "Property type ID is required",
    NAME_REQUIRED: "Property type name is required",
  },

  AMENITY: {
    FETCH_SUCCESS: "Amenities fetched successfully",
    CREATED: "Amenity created successfully",
    UPDATED: "Amenity updated successfully",
    DELETED: "Amenity deleted successfully",
    NOT_FOUND: "Amenity not found",
    ALREADY_EXISTS: "Amenity already exists",
    UPDATE_FAILED: "Amenity update failed",
    INVALID_ID: "Invalid amenity ID",
    ID_REQUIRED: "Amenity ID is required",
    LABEL_REQUIRED: "Amenity label is required",
    EMOJI_REQUIRED: "Amenity emoji is required",
  },
  REVENUE: {
    STATS_SUCCESS: "Revenue statistics fetched successfully",
    TREND_SUCCESS: "Revenue trend fetched successfully",
    TRANSACTIONS_SUCCESS: "Transactions fetched successfully",
    FETCH_FAILED: "Failed to fetch revenue data",
    INVALID_QUERY: "Invalid query parameters",
  },
  COMMON: {
    INTERNAL_SERVER_ERROR: "Something went wrong",
  },
} as const;
