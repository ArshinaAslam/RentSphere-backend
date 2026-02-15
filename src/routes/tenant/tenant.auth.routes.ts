
import Router from 'express';
import { container } from "tsyringe";
import { asyncHandler } from '../../middleware/asyncHandler';

 import { authenticateToken } from '../../middleware/auth.middleware';
import { TenantAuthController } from '../../controllers/implementation/tenant/tenantAuthController';
// import { uploadImage, uploadKycImages } from '../../../config/multer';


const router = Router()

const tenantAuthController = container.resolve(TenantAuthController)





router.post('/signup',asyncHandler(tenantAuthController.tenantSignup.bind(tenantAuthController)))
router.post('/verify-otp',asyncHandler(tenantAuthController.verifyTenantOtp.bind(tenantAuthController)))
router.post('/login',asyncHandler(tenantAuthController.tenantLogin.bind(tenantAuthController)))
router.post('/forgot-password',asyncHandler(tenantAuthController.tenantForgotPassword.bind(tenantAuthController)))
router.post('/reset-password',asyncHandler(tenantAuthController.tenantResetPassword.bind(tenantAuthController)))
 router.post('/google-auth', asyncHandler(tenantAuthController.googleAuth.bind(tenantAuthController)))






router.post('/resend-otp',asyncHandler(tenantAuthController.resendTenantOtp.bind(tenantAuthController)))





router.post('/refresh',asyncHandler(tenantAuthController.refreshTenantToken.bind(tenantAuthController)))

router.post('/logout',authenticateToken,asyncHandler(tenantAuthController.logout.bind(tenantAuthController)))


export default router;