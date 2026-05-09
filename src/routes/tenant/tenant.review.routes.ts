// routes/review.routes.ts
import { Router } from "express";
import { container } from "tsyringe";

import { TenantReviewController } from "../../controllers/tenant/tenant.review.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { tenantOnly } from "../../middleware/role.middleware";

const router = Router();
const reviewController = container.resolve(TenantReviewController);

router.post(
  "/review-submit",
  authenticateToken,
  tenantOnly,
  reviewController.submitReview.bind(reviewController),
);

router.get(
  "/my-review/:propertyId",
  authenticateToken,
  tenantOnly,
  reviewController.getMyReview.bind(reviewController),
);

// router.get(
//   "/property/:propertyId",
//   reviewController.getPropertyReviews.bind(reviewController),
// );

export default router;
