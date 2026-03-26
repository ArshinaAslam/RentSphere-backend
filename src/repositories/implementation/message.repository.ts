import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import MessageModel from "../../models/messageModel";

import type { IMessage } from "../../models/messageModel";
import type { IMessageRepository } from "../interface/IMessageRepository";
import type { FilterQuery } from "mongoose";

@injectable()
export class MessageRepository
  extends BaseRepository<IMessage>
  implements IMessageRepository
{
  constructor() {
    super(MessageModel);
  }

  async createMessage(data: Partial<IMessage>): Promise<IMessage> {
    return this.create(data);
  }

  async findByConversationId(
    conversationId: string,
    skip: number,
    limit: number,
  ): Promise<IMessage[]> {
    const total = await this.model.countDocuments({ conversationId });

    const adjustedSkip = Math.max(0, total - limit - skip);
    return this.model
      .find({ conversationId } as FilterQuery<IMessage>)
      .sort({ createdAt: 1 })
      .skip(adjustedSkip)
      .limit(limit)
      .exec();
  }

  async countByConversationId(conversationId: string): Promise<number> {
    return this.model.countDocuments({
      conversationId,
    } as FilterQuery<IMessage>);
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.model.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      } as FilterQuery<IMessage>,
      { isRead: true },
    );
  }

  async countUnread(conversationId: string, userId: string): Promise<number> {
    return this.model.countDocuments({
      conversationId,
      senderId: { $ne: userId },
      isRead: false,
    } as FilterQuery<IMessage>);
  }

  // async findCallMessages(userId: string): Promise<IMessage[]> {
  //   return this.model
  //     .find({
  //       senderId: userId,
  //       $or: [
  //         { content: { $regex: /^Voice call/ } },
  //         { content: { $regex: /^Video call/ } },
  //       ],
  //     })
  //     .sort({ createdAt: -1 })
  //     .limit(50)

  //     .exec();
  // }

  async findCallMessages(conversationIds: string[]): Promise<IMessage[]> {
    return this.model
      .find({
        conversationId: { $in: conversationIds },
        $or: [
          { content: { $regex: /^Voice call/ } },
          { content: { $regex: /^Video call/ } },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }
}
