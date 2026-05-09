import { Router } from "express";
import { container } from "tsyringe";

import { NotificationController } from "../../controllers/notification/notification.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();
const notificationController = container.resolve(NotificationController);

router.get(
  "/get-notifications",
  authenticateToken,
  asyncHandler(
    notificationController.getMyNotifications.bind(notificationController),
  ),
);
router.get(
  "/unread-count",
  authenticateToken,
  asyncHandler(
    notificationController.getUnreadCount.bind(notificationController),
  ),
);
router.patch(
  "/:notificationId/read",
  authenticateToken,
  asyncHandler(notificationController.markAsRead.bind(notificationController)),
);
router.patch(
  "/read-all",
  authenticateToken,
  asyncHandler(
    notificationController.markAllAsRead.bind(notificationController),
  ),
);

export default router;
