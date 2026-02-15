
import Router from 'express';
import { container } from "tsyringe";
import { asyncHandler } from '../../middleware/asyncHandler';
import { AdminAuthController } from '../../controllers/implementation/admin/admin.auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

 


const router = Router()

const adminAuthController = container.resolve(AdminAuthController)




router.post('/login', asyncHandler(adminAuthController.adminLogin.bind(adminAuthController)))
router.post('/refresh',asyncHandler(adminAuthController.refreshAdminToken.bind(AdminAuthController)))
router.post('/logout',authenticateToken,asyncHandler(adminAuthController.logout.bind(adminAuthController)))

export default router;