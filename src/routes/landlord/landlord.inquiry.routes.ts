import { Router } from "express";
import { container } from "tsyringe";

import { LandlordInquiryController } from "../../controllers/implementation/landlord/landlord.inquiry.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { landlordOnly } from "../../middleware/role.middleware";

const router = Router();
const inquiryController = container.resolve(LandlordInquiryController);

router.get(
  "/all-inquiries",
  authenticateToken,
  landlordOnly,
  asyncHandler(inquiryController.getLandlordInquiries.bind(inquiryController)),
);

export default router;
