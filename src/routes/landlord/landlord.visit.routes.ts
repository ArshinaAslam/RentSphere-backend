import { Router } from "express";
import { container } from "tsyringe";

import { LandlordVisitController } from "../../controllers/implementation/landlord/landlord.visit.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { landlordOnly } from "../../middleware/role.middleware";

const router = Router();
const visitController = container.resolve(LandlordVisitController);

router.get(
  "/visit-requests",
  authenticateToken,
  landlordOnly,
  asyncHandler(visitController.getLandlordVisits.bind(visitController)),
);
router.patch(
  "/visit-requests/:id",
  authenticateToken,
  landlordOnly,
  asyncHandler(visitController.updateVisitStatus.bind(visitController)),
);

export default router;
