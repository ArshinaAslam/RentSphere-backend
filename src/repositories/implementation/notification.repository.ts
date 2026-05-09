import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import NotificationModel, {
  INotification,
} from "../../models/notificationModel";

import type { INotificationRepository } from "../interface/INotificationRepository";

@injectable()
export class NotificationRepository
  extends BaseRepository<INotification>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel);
  }

  async create(data: Partial<INotification>): Promise<INotification> {
    return super.create(data);
  }

  async findByRecipient(
    recipientId: string,
    limit = 30,
  ): Promise<INotification[]> {
    return this.model
      .find({ recipientId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async countUnread(recipientId: string): Promise<number> {
    return this.model.countDocuments({ recipientId, isRead: false }).exec();
  }

  async markAsRead(id: string, recipientId: string): Promise<void> {
    await this.model
      .findOneAndUpdate({ _id: id, recipientId }, { isRead: true })
      .exec();
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this.model
      .updateMany({ recipientId, isRead: false }, { isRead: true })
      .exec();
  }
}
