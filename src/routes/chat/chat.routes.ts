import { Router } from "express";
import { container } from "tsyringe";

import { uploadVoice } from "../../config/multer";
import { ChatController } from "../../controllers/implementation/chat/chat.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();
const chatController = container.resolve(ChatController);

router.post(
  "/start",
  authenticateToken,
  chatController.startConversation.bind(chatController),
);
router.post(
  "/message",
  authenticateToken,
  chatController.sendMessage.bind(chatController),
);
router.get(
  "/landlord/conversations",
  authenticateToken,
  chatController.getLandlordConversations.bind(chatController),
);
router.get(
  "/tenant/conversations",
  authenticateToken,
  chatController.getTenantConversations.bind(chatController),
);
router.get(
  "/messages",
  authenticateToken,
  chatController.getMessages.bind(chatController),
);
router.patch(
  "/read",
  authenticateToken,
  chatController.markAsRead.bind(chatController),
);
router.post(
  "/send-voice",
  authenticateToken,
  uploadVoice.single("audio"),
  asyncHandler(chatController.uploadVoiceMessage.bind(chatController)),
);

router.get(
  "/call-history",
  authenticateToken,
  asyncHandler(chatController.getCallHistory.bind(chatController)),
);

export default router;
