import { Router } from "express";

import landlordInquiryRoutes from "../routes/landlord/landlord.inquiry.routes";
import landlordKycRoutes from "../routes/landlord/landlord.kyc.routes";
import landlordProfileRoutes from "../routes/landlord/landlord.profile.routes";
import landlordPropertyRoutes from "../routes/landlord/landlord.properties.routes";
import landlordVisitRoutes from "../routes/landlord/landlord.visit.routes";

const landlordRouter = Router();

landlordRouter.use("/profile", landlordProfileRoutes);
landlordRouter.use("/properties", landlordPropertyRoutes);
landlordRouter.use("/visits", landlordVisitRoutes);
landlordRouter.use("/inquiry", landlordInquiryRoutes);
landlordRouter.use("/kyc", landlordKycRoutes);

export default landlordRouter;
