import { Router } from "express";



import inquiryRoutes from "../routes/tenant/tenant.inquiry.routes";
import profileRoutes from "../routes/tenant/tenant.profile.routes";
import propertyRoutes from "../routes/tenant/tenant.property.routes";
import visitRoutes from "../routes/tenant/tenant.visit.routes";

const tenantRouter = Router();


tenantRouter.use("/profile", profileRoutes);
tenantRouter.use("/properties", propertyRoutes);
tenantRouter.use("/visits", visitRoutes);
tenantRouter.use("/inquiry", inquiryRoutes);

export default tenantRouter;
