import Router from "express";
import { container } from "tsyringe";

import { TenantVisitController } from "../../controllers/implementation/tenant/tenant.visit.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { tenantOnly } from "../../middleware/role.middleware";

const router = Router();
const visitController = container.resolve(TenantVisitController);

router.get(
  "/booked-slots",
  authenticateToken,
  tenantOnly,
  asyncHandler(visitController.getBookedSlots.bind(visitController)),
);

router.post(
  "/book",
  authenticateToken,
  tenantOnly,
  asyncHandler(visitController.bookVisit.bind(visitController)),
);

router.get(
  "/my-visits",
  authenticateToken,
  tenantOnly,
  asyncHandler(visitController.getTenantVisits.bind(visitController)),
);

router.patch(
  "/cancel/:id",
  authenticateToken,
  tenantOnly,
  asyncHandler(visitController.cancelVisit.bind(visitController)),
);

export default router;
