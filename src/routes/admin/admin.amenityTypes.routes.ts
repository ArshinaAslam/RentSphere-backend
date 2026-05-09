import { Router } from "express";
import { container } from "tsyringe";

import { AdminAmenityTypeController } from "../../controllers/admin/admin.amenityType.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/role.middleware";

const router = Router();

const amenityController = container.resolve(AdminAmenityTypeController);

router.get(
  "/amenities",
  authenticateToken,
  adminOnly,
  asyncHandler(amenityController.getAmenities.bind(amenityController)),
);

router.post(
  "/add-amenities",
  authenticateToken,
  adminOnly,
  asyncHandler(amenityController.addAmenity.bind(amenityController)),
);

router.patch(
  "/toggle-amenities/:amenityId",
  authenticateToken,
  adminOnly,
  asyncHandler(amenityController.toggleAmenity.bind(amenityController)),
);

router.delete(
  "/delete-amenities/:amenityId",
  authenticateToken,
  adminOnly,
  asyncHandler(amenityController.deleteAmenity.bind(amenityController)),
);

export default router;
