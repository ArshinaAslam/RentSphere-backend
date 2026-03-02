import Router from "express";
import { container } from "tsyringe";

import { TenantPropertyController } from "../../controllers/implementation/tenant/tenant.property.controller";
import { asyncHandler } from "../../middleware/asyncHandler";

const router = Router();

const tenantPropertyController = container.resolve(TenantPropertyController);

router.get(
  "/fetch-all-properties",
  asyncHandler(
    tenantPropertyController.getAllProperties.bind(tenantPropertyController),
  ),
);
router.get(
  "/single-property/:propertyId",
  asyncHandler(
    tenantPropertyController.getPropertyById.bind(tenantPropertyController),
  ),
);

export default router;
