import { Router } from 'express';

import authRoutes from '../routes/tenant/tenant.auth.routes'
import profileRoutes from '../routes/tenant/tenant.profile.routes'


const landlordRouter = Router();

landlordRouter.use('/auth', authRoutes);
landlordRouter.use('/profile',profileRoutes)


export default landlordRouter;