import { Router } from "express";

import amenityTypesRoutes from "../routes/admin/admin.amenityTypes.routes";
import authRoutes from "../routes/admin/admin.auth.routes";
import landlordRoutes from "../routes/admin/admin.landlords.routes";
import propertyRoutes from "../routes/admin/admin.property.routes";
import propertyTypesRoutes from "../routes/admin/admin.propertyTypes.routes";
import revenueRoutes from "../routes/admin/admin.revenue.routes";
import tenantRoutes from "../routes/admin/admin.tenants.routes";

const adminRouter = Router();

adminRouter.use("/auth", authRoutes);
adminRouter.use("/tenants", tenantRoutes);
adminRouter.use("/landlords", landlordRoutes);
adminRouter.use("/property", propertyRoutes);
adminRouter.use("/property-types", propertyTypesRoutes);
adminRouter.use("/amenity-types", amenityTypesRoutes);
adminRouter.use("/revenue", revenueRoutes);

export default adminRouter;
