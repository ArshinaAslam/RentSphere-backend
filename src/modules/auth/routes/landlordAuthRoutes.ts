
// import Router from 'express';
// import { authController } from '../auth.container';
// import { asyncHandler } from '../../../middleware/asyncHandler';

// import { authenticateToken } from '../../../middleware/auth.middleware';
// import { uploadImage, uploadKycImages } from '../../../config/multer';
// import { landlordOnly, tenantOnly, tenantOrLandlord } from '../../../middleware/role.middleware';


// const router = Router()


// router.post('/landlord/signup',asyncHandler(authController.landlordSignup.bind(authController)))
// router.post('/landlord/verify-otp',asyncHandler(authController.verifyLandlordOtp.bind(authController)))
// router.post('/landlord/kyc-submit', 
//   uploadKycImages,    
//   authController.submitLandlordKyc.bind(authController)
// );

// router.get(
//   '/landlord/kyc-status',
  
//   asyncHandler(authController.getKycStatus.bind(authController))
// );
// router.post('/landlord/login',asyncHandler(authController.landlordLogin.bind(authController)))
// router.post('/landlord/forgot-password',asyncHandler(authController.landlordForgotPassword.bind(authController)))


// router.post('/landlord/resend-otp',asyncHandler(authController.resendOtp.bind(authController)))


// router.post('/tenant/forgot-password',asyncHandler(authController.tenantForgotPassword.bind(authController)))
// router.post('/reset-password',asyncHandler(authController.tenantResetPassword.bind(authController)))
//  router.post('/google-auth', asyncHandler(authController.googleAuth.bind(authController)))

// router.post('/tenant/change-password',authenticateToken,tenantOnly,asyncHandler(authController.changeTenantPassword.bind(authController)))
// router.post('/landlord/change-password',authenticateToken,landlordOnly,asyncHandler(authController.changeLandlordPassword.bind(authController)))
// router.post('/tenant/editProfile', 
//     uploadImage.single('avatar'),  
//   authenticateToken, tenantOnly,
  
//   authController.editTenantProfile.bind(authController)
// );

// router.post('/landlord/editProfile', 
//     uploadImage.single('avatar'),  
//   authenticateToken, landlordOnly, 
  
//   authController.editLandlordProfile.bind(authController)
// );




// // router.get('/dashboard', authenticateToken, asyncHandler(controller.getDashboard));








//  router.post('/admin/login', asyncHandler(authController.adminLogin.bind(authController)));
// export default router;
