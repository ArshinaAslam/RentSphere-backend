import { Router } from "express";
import { container } from "tsyringe";

import { AdminPropertyTypeController } from "../../controllers/admin/admin.propertyType.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/role.middleware";

const router = Router();

const propertyTypeController = container.resolve(AdminPropertyTypeController);

router.get(
  "/all-property-types",
  authenticateToken,
  adminOnly,
  asyncHandler(
    propertyTypeController.getPropertyTypes.bind(propertyTypeController),
  ),
);

router.post(
  "/add-property-types",
  authenticateToken,
  adminOnly,
  asyncHandler(
    propertyTypeController.addPropertyType.bind(propertyTypeController),
  ),
);

router.patch(
  "/toggle-property-types/:propertyTypeId",
  authenticateToken,
  adminOnly,
  asyncHandler(
    propertyTypeController.togglePropertyType.bind(propertyTypeController),
  ),
);

router.delete(
  "/delete-property-types/:propertyTypeId",
  authenticateToken,
  adminOnly,
  asyncHandler(
    propertyTypeController.deletePropertyType.bind(propertyTypeController),
  ),
);

export default router;
