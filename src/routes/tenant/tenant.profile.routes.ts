import Router from "express";
import { container } from "tsyringe";

import { uploadImage } from "../../config/multer";
import { TenantProfileController } from "../../controllers/implementation/tenant/tenant.profile.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { tenantOnly } from "../../middleware/role.middleware";

const router = Router();

const tenantProfileController = container.resolve(TenantProfileController);

router.post(
  "/change-password",
  authenticateToken,
  tenantOnly,
  asyncHandler(
    tenantProfileController.changeTenantPassword.bind(tenantProfileController),
  ),
);

router.post(
  "/editProfile",
  uploadImage.single("avatar"),
  authenticateToken,
  tenantOnly,

  tenantProfileController.editTenantProfile.bind(tenantProfileController),
);

export default router;
