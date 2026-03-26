export interface CreateDepositOrderDto {
  leaseId: string;
}

export interface CreateRentOrderDto {
  leaseId: string;
  month: number;
  year: number;
}

export interface VerifyPaymentDto {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentId: string;
}

// export interface GetPaymentsQueryDto {
//   page: number;
//   limit: number;
//   search?: string;
//   type?: "deposit" | "rent" | "late_fee" | "refund";
//   status?: "pending" | "completed" | "failed";
// }

export interface GetPaymentsQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  type?: string;
  status?: string;
}
