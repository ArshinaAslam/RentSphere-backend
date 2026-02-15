// import Router from 'express';

// import { userController } from '../user.container';
// import { asyncHandler } from '../../../middleware/asyncHandler';
// import { authenticateToken } from '../../../middleware/auth.middleware';
// import { adminOnly } from '../../../middleware/role.middleware';

// const router = Router();


// router.get(
//   '/admin/tenantList', 
//   authenticateToken, 
//   adminOnly, 
//   asyncHandler(userController.getTenants.bind(userController)
// ))

// router.get(
//   '/admin/landlordList', 
//   authenticateToken, 
//   adminOnly, 
//   asyncHandler(userController.getLandlords.bind(userController))
// );


// router.get(
//   '/admin/landlordList/:id', 
//   authenticateToken, 
//   adminOnly, 
//   asyncHandler(userController.getLandlordDetails.bind(userController))
// );




// router.patch(
//   '/admin/users/:id/status',
//   authenticateToken,
//   adminOnly,
//   asyncHandler(userController.toggleUserStatus.bind(userController))
// );


// router.patch(
//   '/admin/approve-landlordKyc/:id',
//   authenticateToken,
//   adminOnly,
//   asyncHandler(userController.approveLandlordKyc.bind(userController))
// );

// router.patch(
//   '/admin/reject-landlordKyc/:id', 
//   authenticateToken,
//   adminOnly,
//   asyncHandler(userController.rejectLandlordKyc.bind(userController))
// );




// export default router;
