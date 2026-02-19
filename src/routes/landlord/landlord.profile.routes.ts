
import Router from 'express';
import { container } from "tsyringe";
import { asyncHandler } from '../../middleware/asyncHandler';



import {  uploadImage, } from '../../config/multer';
import { authenticateToken } from '../../middleware/auth.middleware';
import { landlordOnly } from '../../middleware/role.middleware';
import { LandlordProfileController } from '../../controllers/implementation/landlord/landlord.profile.controller';
const router = Router()

const   landlordProfileController = container.resolve(LandlordProfileController)



router.post('/editProfile', 
    uploadImage.single('avatar'),  
  authenticateToken, landlordOnly, 
  
  landlordProfileController.editLandlordProfile.bind(landlordProfileController)
);

router.post('/change-password',authenticateToken,landlordOnly,asyncHandler(landlordProfileController.changeLandlordPassword.bind(landlordProfileController)))



export default router;