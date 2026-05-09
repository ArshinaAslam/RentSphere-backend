import Router from "express";
import { container } from "tsyringe";

import { AdminAuthController } from "../../controllers/admin/admin.auth.controller";
import { asyncHandler } from "../../middleware/asyncHandler";

const router = Router();

const adminAuthController = container.resolve(AdminAuthController);

router.post(
  "/login",
  asyncHandler(adminAuthController.adminLogin.bind(adminAuthController)),
);

export default router;
