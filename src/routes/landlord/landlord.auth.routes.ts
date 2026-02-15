
import Router from 'express';
import { container } from "tsyringe";
import { asyncHandler } from '../../middleware/asyncHandler';


import { LandlordAuthController } from '../../controllers/implementation/landlord/landlod.auth.controller';
import {  uploadKycImages } from '../../config/multer';
const router = Router()

const   landlordAuthController = container.resolve(LandlordAuthController)

router.post('/landlord/signup',asyncHandler(landlordAuthController.landlordSignup.bind(landlordAuthController)))
router.post('/landlord/verify-otp',asyncHandler(landlordAuthController.verifyLandlordOtp.bind(landlordAuthController)))
router.post('/landlord/kyc-submit', 
  uploadKycImages,    
  landlordAuthController.submitLandlordKyc.bind(landlordAuthController)
);

router.get(
  '/landlord/kyc-status',
  
  asyncHandler(landlordAuthController.getKycStatus.bind(landlordAuthController))
);
router.post('/landlord/login',asyncHandler(landlordAuthController.landlordLogin.bind(landlordAuthController)))
router.post('/landlord/forgot-password',asyncHandler(landlordAuthController.landlordForgotPassword.bind(landlordAuthController)))
export default router;