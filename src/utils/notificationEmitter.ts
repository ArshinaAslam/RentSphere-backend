import { container } from "tsyringe";

import { DI_TYPES } from "../common/di/types";
import { getIO, getOnlineUsers } from "../socket/socket";

import type { CreateNotificationDto } from "../dto/notification/notification.dto";
import type { INotificationRepository } from "../repositories/interface/INotificationRepository";

export async function createAndEmitNotification(
  dto: CreateNotificationDto,
): Promise<void> {
  const repo = container.resolve<INotificationRepository>(
    DI_TYPES.NotificationRepository,
  );

  const notification = await repo.create(dto);

  const onlineUsers = getOnlineUsers();
  const socketId = onlineUsers.get(dto.recipientId);
  if (socketId) {
    getIO()
      .to(socketId)
      .emit("notification:new", {
        _id: String(notification._id),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        link: notification.link,
        createdAt: notification.createdAt,
      });
  }
}
