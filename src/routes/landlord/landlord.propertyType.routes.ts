// routes/landlord/landlordPropertyTypeRoutes.ts
import { Router } from "express";
import { container } from "tsyringe";

import { LandlordPropertyTypeController } from "../../controllers/landlord/landlord.propertyType.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { landlordOnly } from "../../middleware/role.middleware";

const router = Router();

const propertyTypeController = container.resolve(
  LandlordPropertyTypeController,
);

router.get(
  "/active-property-types",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    propertyTypeController.getActivePropertyTypes.bind(propertyTypeController),
  ),
);

export default router;
