import { Router } from 'express';

// import authRoutes from '../routes/tenant/tenant.auth.routes'
import landlordProfileRoutes from '../routes/landlord/landlord.profile.routes'


const landlordRouter = Router();

// landlordRouter.use('/auth', authRoutes);
landlordRouter.use('/profile',landlordProfileRoutes)


export default landlordRouter;