import { Router } from 'express';

import authRoutes from '../routes/tenant/tenant.auth.routes'
import profileRoutes from '../routes/tenant/tenant.profile.routes'


const tenantRouter = Router();

tenantRouter.use('/auth', authRoutes);
tenantRouter.use('/profile',profileRoutes)


export default tenantRouter;