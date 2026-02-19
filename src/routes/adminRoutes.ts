import { Router } from 'express';

import authRoutes from '../routes/admin/admin.auth.routes';
import tenantRoutes from '../routes/admin/admin.tenants.routes';
import landlordRoutes from '../routes/admin/admin.landlords.routes';

const adminRouter = Router();

adminRouter.use('/auth', authRoutes);
adminRouter.use('/tenants',tenantRoutes)
adminRouter.use('/landlords',landlordRoutes)



export default adminRouter;