// routes/landlord/landlordAmenityRoutes.ts
import { Router } from "express";
import { container } from "tsyringe";

import { LandlordAmenityController } from "../../controllers/landlord/landlord.amenity.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { landlordOnly } from "../../middleware/role.middleware";

const router = Router();

const amenityController = container.resolve(LandlordAmenityController);

router.get(
  "/active-amenities",
  authenticateToken,
  landlordOnly,
  asyncHandler(amenityController.getActiveAmenities.bind(amenityController)),
);

export default router;
