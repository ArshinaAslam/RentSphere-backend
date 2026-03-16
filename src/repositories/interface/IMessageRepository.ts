import type { IMessage } from "../../models/messageModel";

export interface IMessageRepository {
  createMessage(data: Partial<IMessage>): Promise<IMessage>;
  findByConversationId(
    conversationId: string,
    skip: number,
    limit: number,
  ): Promise<IMessage[]>;
  countByConversationId(conversationId: string): Promise<number>;
  markAsRead(conversationId: string, userId: string): Promise<void>;
  countUnread(conversationId: string, userId: string): Promise<number>;

  findCallMessages(conversationIds: string[]): Promise<IMessage[]>;
}
