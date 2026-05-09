import { Router } from "express";
import { container } from "tsyringe";

import { LandlordPaymentController } from "../../controllers/landlord/landlord.payment.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { landlordOnly } from "../../middleware/role.middleware";

const router = Router();
const landlordPaymentController = container.resolve(LandlordPaymentController);

router.get(
  "/payment-history",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    landlordPaymentController.getLandlordPayments.bind(
      landlordPaymentController,
    ),
  ),
);

router.get(
  "/details/:paymentId",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    landlordPaymentController.getPaymentById.bind(landlordPaymentController),
  ),
);

router.get(
  "/property/:propertyId",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    landlordPaymentController.getPaymentsByProperty.bind(
      landlordPaymentController,
    ),
  ),
);

export default router;
