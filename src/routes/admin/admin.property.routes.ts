import { Router } from "express";
import { container } from "tsyringe";

import { AdminPropertyController } from "../../controllers/admin/admin.property.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/role.middleware";

const router = Router();

const propertyController = container.resolve(AdminPropertyController);

router.get(
  "/fetch-properties",
  authenticateToken,
  adminOnly,
  asyncHandler(propertyController.getProperties.bind(propertyController)),
);

export default router;
