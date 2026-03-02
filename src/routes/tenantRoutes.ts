import { Router } from "express";

// import authRoutes from '../routes/tenant/tenant.auth.routes'
import profileRoutes from "../routes/tenant/tenant.profile.routes";
import propertyRoutes from "../routes/tenant/tenant.property.routes";
import visitRoutes from "../routes/tenant/tenant.visit.routes";

const tenantRouter = Router();

// tenantRouter.use('/auth', authRoutes);
tenantRouter.use("/profile", profileRoutes);
tenantRouter.use("/properties", propertyRoutes);
tenantRouter.use("/visits", visitRoutes);

export default tenantRouter;
