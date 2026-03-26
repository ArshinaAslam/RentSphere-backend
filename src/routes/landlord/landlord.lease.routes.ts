import { Router } from "express";
import { container } from "tsyringe";

import { LandlordLeaseController } from "../../controllers/implementation/landlord/landlord.lease.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { landlordOnly } from "../../middleware/role.middleware";

const router = Router();
const landlordLeaseController = container.resolve(LandlordLeaseController);

router.post(
  "/create-lease",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    landlordLeaseController.createLease.bind(landlordLeaseController),
  ),
);

router.put(
  "/update-lease/:leaseId",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    landlordLeaseController.updateLease.bind(landlordLeaseController),
  ),
);

router.patch(
  "/send-lease/:leaseId",
  authenticateToken,
  landlordOnly,
  asyncHandler(landlordLeaseController.sendLease.bind(landlordLeaseController)),
);

router.get(
  "/get-all-leases",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    landlordLeaseController.getLandlordLeases.bind(landlordLeaseController),
  ),
);

router.get(
  "/get-lease/:leaseId",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    landlordLeaseController.getLeaseById.bind(landlordLeaseController),
  ),
);

router.patch(
  "/terminate-lease/:leaseId",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    landlordLeaseController.terminateLease.bind(landlordLeaseController),
  ),
);

router.delete(
  "/delete-lease/:leaseId",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    landlordLeaseController.deleteLease.bind(landlordLeaseController),
  ),
);

router.patch(
  "/sign/:leaseId",
  authenticateToken,
  landlordOnly,
  asyncHandler(landlordLeaseController.signLease.bind(landlordLeaseController)),
);

router.get(
  "/search-tenant",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    landlordLeaseController.searchTenants.bind(landlordLeaseController),
  ),
);

router.get(
  "/properties",
  authenticateToken,
  landlordOnly,
  asyncHandler(
    landlordLeaseController.getLandlordProperties.bind(landlordLeaseController),
  ),
);

export default router;
