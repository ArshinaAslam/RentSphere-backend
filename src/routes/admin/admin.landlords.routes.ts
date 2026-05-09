import Router from "express";
import { container } from "tsyringe";

import { AdminLandlordController } from "../../controllers/admin/admin.landlord.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/role.middleware";

const router = Router();
const adminLandlordController = container.resolve(AdminLandlordController);

router.get(
  "/landlordList",
  authenticateToken,
  adminOnly,
  asyncHandler(
    adminLandlordController.getLandlords.bind(adminLandlordController),
  ),
);

router.get(
  "/landlordList/:landlordId",
  authenticateToken,
  adminOnly,
  asyncHandler(
    adminLandlordController.getLandlordDetails.bind(adminLandlordController),
  ),
);

router.patch(
  "/:landlordId/status",
  authenticateToken,
  adminOnly,
  asyncHandler(
    adminLandlordController.toggleLandlordStatus.bind(adminLandlordController),
  ),
);

router.patch(
  "/approve-landlordKyc/:landlordId",
  authenticateToken,
  adminOnly,
  asyncHandler(
    adminLandlordController.approveLandlordKyc.bind(adminLandlordController),
  ),
);

router.patch(
  "/reject-landlordKyc/:landlordId",
  authenticateToken,
  adminOnly,
  asyncHandler(
    adminLandlordController.rejectLandlordKyc.bind(adminLandlordController),
  ),
);

export default router;
