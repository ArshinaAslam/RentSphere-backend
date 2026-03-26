import { Router } from "express";

import inquiryRoutes from "../routes/tenant/tenant.inquiry.routes";
import tenantLeaseRoutes from "../routes/tenant/tenant.lease.routes";
import paymentRoutes from "../routes/tenant/tenant.payment.routes";
import profileRoutes from "../routes/tenant/tenant.profile.routes";
import propertyRoutes from "../routes/tenant/tenant.property.routes";
import visitRoutes from "../routes/tenant/tenant.visit.routes";
import wishlistRoutes from "../routes/tenant/tenant.wishlist.routes";

const tenantRouter = Router();

tenantRouter.use("/profile", profileRoutes);
tenantRouter.use("/properties", propertyRoutes);
tenantRouter.use("/visits", visitRoutes);
tenantRouter.use("/inquiry", inquiryRoutes);
tenantRouter.use("/wishlist", wishlistRoutes);
tenantRouter.use("/leases", tenantLeaseRoutes);
tenantRouter.use("/payments", paymentRoutes);

export default tenantRouter;
