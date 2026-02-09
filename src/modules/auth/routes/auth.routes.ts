
import Router from 'express';
import { authController } from '../auth.container';
import { asyncHandler } from '../../../middleware/asyncHandler';

import { authenticateToken } from '../../../middleware/auth.middleware';
import { uploadImage, uploadKycImages } from '../../../config/multer';
import { landlordOnly, tenantOnly, tenantOrLandlord } from '../../../middleware/role.middleware';


const router = Router()








router.post('/tenant/signup',asyncHandler(authController.tenantSignup.bind(authController)))
router.post('/tenant/verify-otp',asyncHandler(authController.verifyTenantOtp.bind(authController)))
router.post('/tenant/login',asyncHandler(authController.tenantLogin.bind(authController)))
router.post('/tenant/forgot-password',asyncHandler(authController.tenantForgotPassword.bind(authController)))
router.post('/tenant/reset-password',asyncHandler(authController.tenantResetPassword.bind(authController)))
 router.post('/google-auth', asyncHandler(authController.googleAuth.bind(authController)))
//  router.post('/tenant/editProfile',authenticateToken,tenantOnly,asyncHandler(authController.editTenantProfile.bind(authController)))
router.post('/tenant/change-password',authenticateToken,tenantOnly,asyncHandler(authController.changeTenantPassword.bind(authController)))
router.post('/landlord/change-password',authenticateToken,landlordOnly,asyncHandler(authController.changeLandlordPassword.bind(authController)))
router.post('/tenant/editProfile', 
    uploadImage.single('avatar'),  
  authenticateToken, tenantOnly, 
  
  authController.editTenantProfile.bind(authController)
);

router.post('/landlord/editProfile', 
    uploadImage.single('avatar'),  
  authenticateToken, landlordOnly, 
  
  authController.editLandlordProfile.bind(authController)
);



router.post('/landlord/signup',asyncHandler(authController.landlordSignup.bind(authController)))
router.post('/landlord/verify-otp',asyncHandler(authController.verifyLandlordOtp.bind(authController)))
router.post('/landlord/kyc-submit', 
  uploadKycImages,    
  authController.submitLandlordKyc.bind(authController)
);

router.get(
  '/landlord/kyc-status',
  
  asyncHandler(authController.getKycStatus.bind(authController))
);
router.post('/landlord/login',asyncHandler(authController.landlordLogin.bind(authController)))

// router.post(
//   '/kyc/submit',
//   uploadImage.fields([
//     { name: 'aadhaarFront', maxCount: 1 },
//     { name: 'aadhaarBack',  maxCount: 1 },
//     { name: 'panCard',      maxCount: 1 },
//     { name: 'liveSelfie',   maxCount: 1 },
//   ]),
//   asyncHandler(authcontroller.submitLandlordKyc.bind(authcontroller))
// );

router.post('/resend-otp',asyncHandler(authController.resendOtp.bind(authController)))
router.post('/refresh',asyncHandler(authController.refreshToken.bind(authController)))
router.get('/me', authenticateToken,tenantOrLandlord, asyncHandler(authController.getMe.bind(authController)));
router.post('/logout',authenticateToken,asyncHandler(authController.logout.bind(authController)))
// router.get('/dashboard', authenticateToken, asyncHandler(controller.getDashboard));





// ✅ FUTURE ROUTES (Role protected)
// router.get('/tenant/dashboard', authenticateToken, tenantOnly, asyncHandler(/* tenantDashboard */));
// router.get('/landlord/dashboard', authenticateToken, landlordOnly, asyncHandler(/* landlordDashboard */));
// router.post('/landlord/properties', authenticateToken, landlordOnly, asyncHandler(/* createProperty */));



 router.post('/admin/login', asyncHandler(authController.adminLogin.bind(authController)));
export default router;
