import type { INotification } from "../models/notificationModel";

export interface NotificationResponseDto {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export class NotificationMapper {
  static toDto(notification: INotification): NotificationResponseDto {
    return {
      _id: String(notification._id),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: new Date(notification.createdAt).toISOString(),
      ...(notification.link && { link: notification.link }),
    };
  }

  static toDtoList(notifications: INotification[]): NotificationResponseDto[] {
    return notifications.map((n) => NotificationMapper.toDto(n));
  }
}
