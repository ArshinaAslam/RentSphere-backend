import { Router } from "express";
import { container } from "tsyringe";

import { TenantInquiryController } from "../../controllers/tenant/tenant.inquiry.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { tenantOnly } from "../../middleware/role.middleware";

const router = Router();
const inquiryController = container.resolve(TenantInquiryController);

router.post(
  "/create-inquiry",
  authenticateToken,
  tenantOnly,
  asyncHandler(inquiryController.createInquiry.bind(inquiryController)),
);

router.get(
  "/my-inquiries",
  authenticateToken,
  tenantOnly,
  asyncHandler(inquiryController.getTenantInquiries.bind(inquiryController)),
);
export default router;
