import { Router } from "express";
import { container } from "tsyringe";

import { TenantWishlistController } from "../../controllers/implementation/tenant/tenant.wishlist.controller";
import { authenticateToken } from "../../middleware/auth.middleware";
import { tenantOnly } from "../../middleware/role.middleware";

const router = Router();
const wishlistController = container.resolve(TenantWishlistController);

router.get(
  "/all-favourites",
  authenticateToken,
  tenantOnly,
  wishlistController.getWishlist.bind(wishlistController),
);
router.post(
  "/add",
  authenticateToken,
  tenantOnly,
  wishlistController.addToWishlist.bind(wishlistController),
);
router.delete(
  "/remove",
  authenticateToken,
  tenantOnly,
  wishlistController.removeFromWishlist.bind(wishlistController),
);

export default router;
