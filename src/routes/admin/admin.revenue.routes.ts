import { Router } from "express";
import { container } from "tsyringe";

import { AdminRevenueController } from "../../controllers/admin/admin.revenue.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/role.middleware";

const router = Router();

const revenueController = container.resolve(AdminRevenueController);

router.get(
  "/stats",
  authenticateToken,
  adminOnly,
  asyncHandler(revenueController.getRevenueStats.bind(revenueController)),
);

router.get(
  "/trend",
  authenticateToken,
  adminOnly,
  asyncHandler(revenueController.getMonthlyTrend.bind(revenueController)),
);

router.get(
  "/transactions",
  authenticateToken,
  adminOnly,
  asyncHandler(revenueController.getAllTransactions.bind(revenueController)),
);

export default router;
