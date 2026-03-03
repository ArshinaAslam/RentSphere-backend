import { Router } from "express";


import landlordProfileRoutes from "../routes/landlord/landlord.profile.routes";
import landlordPropertyRoutes from "../routes/landlord/landlord.properties.routes";
import landlordVisitRoutes from "../routes/landlord/landlord.visit.routes";

const landlordRouter = Router();


landlordRouter.use("/profile", landlordProfileRoutes);
landlordRouter.use("/properties", landlordPropertyRoutes);
landlordRouter.use("/visits", landlordVisitRoutes);

export default landlordRouter;
