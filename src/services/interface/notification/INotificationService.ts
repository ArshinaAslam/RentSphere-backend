import type { CreateNotificationDto } from "../../../dto/notification/notification.dto";
import type { NotificationResponseDto } from "../../../mappers/notification.mapper";

export interface INotificationService {
  create(dto: CreateNotificationDto): Promise<NotificationResponseDto>;
  getMyNotifications(recipientId: string): Promise<NotificationResponseDto[]>;
  getUnreadCount(recipientId: string): Promise<number>;
  markAsRead(id: string, recipientId: string): Promise<void>;
  markAllAsRead(recipientId: string): Promise<void>;
}
