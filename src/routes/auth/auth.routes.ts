
import Router from 'express';
import { container } from "tsyringe";
import { asyncHandler } from '../../middleware/asyncHandler';


import { AuthController } from '../../controllers/implementation/auth/auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
const router = Router()

const   authController = container.resolve(AuthController)

router.post('/signup',asyncHandler(authController.signup.bind(authController)))
router.post('/verify-otp',asyncHandler(authController.verifyOtp.bind(authController)))
// router.post('/kyc-submit', 
//   uploadKycImages,    
//   landlordAuthController.submitLandlordKyc.bind(landlordAuthController)
// );

// router.get(
//   '/kyc-status',
  
//   asyncHandler(landlordAuthController.getKycStatus.bind(landlordAuthController))
// );
router.post('/login',asyncHandler(authController.login.bind(authController)))
router.post('/forgot-password',asyncHandler(authController.forgotPassword.bind(authController)))
router.post('/resend-otp',asyncHandler(authController.resendOtp.bind(authController)))
router.post('/refresh',asyncHandler(authController.refreshToken.bind(authController)))
router.post('/reset-password',asyncHandler(authController.resetPassword.bind(authController)))
 router.post('/google-auth', asyncHandler(authController.googleAuth.bind(authController)))

router.post('/logout',authenticateToken,asyncHandler(authController.logout.bind(authController)))



export default router;