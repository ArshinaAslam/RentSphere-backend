import Router from 'express'
import { landlordOnly } from '../../../middleware/role.middleware';
import { authenticateToken } from '../../../middleware/auth.middleware';
import { uploadKycImages } from '../../../config/multer';
import { authController } from '../auth.container';

const router = Router()

router.post('/landlord/kyc-submit', 
  uploadKycImages,    
  authenticateToken, 
  landlordOnly, 
  authController.submitLandlordKyc.bind(authController)
);
