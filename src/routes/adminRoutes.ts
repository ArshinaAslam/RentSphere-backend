import { Router } from 'express';

import authRoutes from '../routes/admin/admin.auth.routes'


const adminRouter = Router();

adminRouter.use('/auth', authRoutes);



export default adminRouter;