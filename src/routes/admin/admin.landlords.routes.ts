

import Router from 'express';
import { container } from "tsyringe";

import { asyncHandler } from '../../middleware/asyncHandler';
import { authenticateToken } from '../../middleware/auth.middleware';
import { adminOnly } from '../../middleware/role.middleware';
import { AdminLandlordController } from '../../controllers/implementation/admin/admin.landlord.controller';

const router = Router();
const adminLandlordController = container.resolve(AdminLandlordController)



router.get(
  '/landlordList', 
  authenticateToken, 
  adminOnly, 
  asyncHandler(adminLandlordController.getLandlords.bind(adminLandlordController))
);


router.get(
  '/landlordList/:id', 
  authenticateToken, 
  adminOnly, 
  asyncHandler(adminLandlordController.getLandlordDetails.bind(adminLandlordController))
);




router.patch(
  '/:id/status',
  authenticateToken,
  adminOnly,
  asyncHandler(adminLandlordController.toggleLandlordStatus.bind(adminLandlordController))
);


router.patch(
  '/approve-landlordKyc/:id',
  authenticateToken,
  adminOnly,
  asyncHandler(adminLandlordController.approveLandlordKyc.bind(adminLandlordController))
);

router.patch(
  '/reject-landlordKyc/:id', 
  authenticateToken,
  adminOnly,
  asyncHandler(adminLandlordController.rejectLandlordKyc.bind(adminLandlordController))
);




export default router;