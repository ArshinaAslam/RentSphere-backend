import Router from 'express';
import { container } from "tsyringe";
import { asyncHandler } from '../../middleware/asyncHandler';

 import { authenticateToken } from '../../middleware/auth.middleware';
import { uploadImage } from '../../config/multer';
import {  tenantOnly, } from '../../middleware/role.middleware';
import { TenantProfileController } from '../../controllers/implementation/tenant/tenantProfileController';


const router = Router()




const tenantProfileController = container.resolve(TenantProfileController)


router.post('/tenant/change-password',authenticateToken,tenantOnly,asyncHandler(tenantProfileController.changeTenantPassword.bind(tenantProfileController)))

router.post('/tenant/editProfile', 
    uploadImage.single('avatar'),  
  authenticateToken, tenantOnly,
  
  tenantProfileController.editTenantProfile.bind(tenantProfileController)
);

export default router;