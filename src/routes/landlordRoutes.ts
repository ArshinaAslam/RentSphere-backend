import { Router } from "express";

import amenityTypesRoutes from "../routes/landlord/landlord.amenity.routes";
import landlordInquiryRoutes from "../routes/landlord/landlord.inquiry.routes";
import landlordKycRoutes from "../routes/landlord/landlord.kyc.routes";
import landlordLeaseRoutes from "../routes/landlord/landlord.lease.routes";
import landlordPaymentRoutes from "../routes/landlord/landlord.payment.routes";
import landlordProfileRoutes from "../routes/landlord/landlord.profile.routes";
import landlordPropertyRoutes from "../routes/landlord/landlord.properties.routes";
import landlordPropertyTypesRoutes from "../routes/landlord/landlord.propertyType.routes";
import landlordVisitRoutes from "../routes/landlord/landlord.visit.routes";

const landlordRouter = Router();

landlordRouter.use("/profile", landlordProfileRoutes);
landlordRouter.use("/properties", landlordPropertyRoutes);
landlordRouter.use("/visits", landlordVisitRoutes);
landlordRouter.use("/inquiry", landlordInquiryRoutes);
landlordRouter.use("/kyc", landlordKycRoutes);
landlordRouter.use("/leases", landlordLeaseRoutes);
landlordRouter.use("/payments", landlordPaymentRoutes);
landlordRouter.use("/property-types", landlordPropertyTypesRoutes);
landlordRouter.use("/amenity-types", amenityTypesRoutes);

export default landlordRouter;
