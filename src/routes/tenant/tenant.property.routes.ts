import Router from "express";
import { container } from "tsyringe";

import { TenantPropertyController } from "../../controllers/tenant/tenant.property.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { tenantOnly } from "../../middleware/role.middleware";

const router = Router();

const tenantPropertyController = container.resolve(TenantPropertyController);

router.get(
  "/fetch-all-properties",
  authenticateToken,
  tenantOnly,
  asyncHandler(
    tenantPropertyController.getAllProperties.bind(tenantPropertyController),
  ),
);
router.get(
  "/single-property/:propertyId",
  authenticateToken,
  tenantOnly,
  asyncHandler(
    tenantPropertyController.getPropertyById.bind(tenantPropertyController),
  ),
);

router.get(
  "/:propertyId/payments",
  authenticateToken,
  tenantOnly,
  tenantPropertyController.getPropertyPayments.bind(tenantPropertyController),
);

export default router;
