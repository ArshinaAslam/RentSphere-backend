import { Router } from "express";
import { container } from "tsyringe";

import { TenantLeaseController } from "../../controllers/implementation/tenant/tenant.lease.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { tenantOnly } from "../../middleware/role.middleware";

const router = Router();
const tenantLeaseController = container.resolve(TenantLeaseController);

router.get(
  "/my-leases",
  authenticateToken,
  tenantOnly,
  asyncHandler(
    tenantLeaseController.getTenantLeases.bind(tenantLeaseController),
  ),
);

router.get(
  "/my-lease/:leaseId",
  authenticateToken,
  tenantOnly,
  asyncHandler(tenantLeaseController.getLeaseById.bind(tenantLeaseController)),
);

router.patch(
  "/view/:leaseId",
  authenticateToken,
  tenantOnly,
  asyncHandler(tenantLeaseController.markAsViewed.bind(tenantLeaseController)),
);

router.patch(
  "/sign/:leaseId",
  authenticateToken,
  tenantOnly,
  asyncHandler(tenantLeaseController.signLease.bind(tenantLeaseController)),
);

export default router;
