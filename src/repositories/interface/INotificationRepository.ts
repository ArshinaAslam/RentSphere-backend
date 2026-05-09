import type { INotification } from "../../models/notificationModel";

export interface INotificationRepository {
  create(data: Partial<INotification>): Promise<INotification>;
  findByRecipient(
    recipientId: string,
    limit?: number,
  ): Promise<INotification[]>;
  countUnread(recipientId: string): Promise<number>;
  markAsRead(id: string, recipientId: string): Promise<void>;
  markAllAsRead(recipientId: string): Promise<void>;
}
