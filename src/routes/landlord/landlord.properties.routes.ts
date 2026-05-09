import Router from "express";
import { container } from "tsyringe";

import { uploadMultipleImages } from "../../config/multer";
import { LandlordPropertyController } from "../../controllers/landlord/landlord.property.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { landlordOnly } from "../../middleware/role.middleware";
const router = Router();

const landlordPropertyController = container.resolve(
  LandlordPropertyController,
);

router.post(
  "/add-property",
  uploadMultipleImages,
  authenticateToken,
  landlordOnly,

  landlordPropertyController.AddLandlordProperty.bind(
    landlordPropertyController,
  ),
);

router.get(
  "/fetch-all-properties",
  authenticateToken,
  landlordOnly,
  landlordPropertyController.getLandlordProperties.bind(
    landlordPropertyController,
  ),
);

// router.post('/edit-properties',authenticateToken,landlordOnly,asyncHandler(landlordPropertiesController.changeLandlordPassword.bind(landlordPropertiesController)))

router.get(
  "/single-property/:propertyId",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    landlordPropertyController.getLandlordPropertyById.bind(
      landlordPropertyController,
    ),
  ),
);

router.delete(
  "/single-property/:propertyId",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    landlordPropertyController.deleteLandlordProperty.bind(
      landlordPropertyController,
    ),
  ),
);

router.put(
  "/edit-property/:propertyId",
  uploadMultipleImages,
  authenticateToken,
  landlordOnly,
  landlordPropertyController.editLandlordProperty.bind(
    landlordPropertyController,
  ),
);

router.get(
  "/:propertyId/leases",
  authenticateToken,
  landlordOnly,
  landlordPropertyController.getPropertyLeases.bind(landlordPropertyController),
);
router.get(
  "/:propertyId/payments",
  authenticateToken,
  landlordOnly,
  landlordPropertyController.getPropertyPayments.bind(
    landlordPropertyController,
  ),
);
router.get(
  "/:propertyId/reviews",
  authenticateToken,
  landlordOnly,
  landlordPropertyController.getPropertyReviews.bind(
    landlordPropertyController,
  ),
);

export default router;
