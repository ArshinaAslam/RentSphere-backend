import { Router } from "express";

// import authRoutes from '../routes/tenant/tenant.auth.routes'
import landlordProfileRoutes from "../routes/landlord/landlord.profile.routes";
import landlordPropertyRoutes from "../routes/landlord/landlord.properties.routes";

const landlordRouter = Router();

// landlordRouter.use('/auth', authRoutes);
landlordRouter.use("/profile", landlordProfileRoutes);
landlordRouter.use("/properties", landlordPropertyRoutes);

export default landlordRouter;
