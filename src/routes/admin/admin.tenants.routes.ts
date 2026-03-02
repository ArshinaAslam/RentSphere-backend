import Router from "express";
import { container } from "tsyringe";

import { AdminTenantController } from "../../controllers/implementation/admin/admin.tenant.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/role.middleware";

const router = Router();
const adminTenantController = container.resolve(AdminTenantController);

router.get(
  "/tenantList",
  authenticateToken,
  adminOnly,
  asyncHandler(adminTenantController.getTenants.bind(adminTenantController)),
);

router.patch(
  "/:id/status",
  authenticateToken,
  adminOnly,
  asyncHandler(
    adminTenantController.toggleTenantStatus.bind(adminTenantController),
  ),
);

export default router;
