import { injectable } from "tsyringe";

import { BaseRepository } from "../../common/repository/BaseRepository";
import ConversationModel from "../../models/conversationModel";

import type { IConversation } from "../../models/conversationModel";
import type { IConversationRepository } from "../interface/IConversationRepository";
import type { FilterQuery } from "mongoose";

@injectable()
export class ConversationRepository
  extends BaseRepository<IConversation>
  implements IConversationRepository
{
  constructor() {
    super(ConversationModel);
  }

  async findByParticipants(
    tenantId: string,
    landlordId: string,
  ): Promise<IConversation | null> {
    return this.model
      .findOne({ tenantId, landlordId } as FilterQuery<IConversation>)
      .populate("tenantId", "firstName lastName avatar")
      .populate("landlordId", "firstName lastName avatar")
      .exec();
  }

  async findById(conversationId: string): Promise<IConversation | null> {
    return this.model
      .findById(conversationId)
      .populate("tenantId", "firstName lastName avatar")
      .populate("landlordId", "firstName lastName avatar")
      .exec();
  }

  async createConversation(
    data: Partial<IConversation>,
  ): Promise<IConversation> {
    return this.create(data);
  }

  async findByLandlordId(landlordId: string): Promise<IConversation[]> {
    return this.model
      .find({ landlordId } as FilterQuery<IConversation>)
      .populate("tenantId", "firstName lastName avatar")
      .populate("landlordId", "firstName lastName avatar")
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  async findByTenantId(tenantId: string): Promise<IConversation[]> {
    return this.model
      .find({ tenantId } as FilterQuery<IConversation>)
      .populate("tenantId", "firstName lastName avatar")
      .populate("landlordId", "firstName lastName avatar")
      .sort({ lastMessageAt: -1 })
      .exec();
  }
  async updateLastMessage(
    conversationId: string,
    message: string,
    senderRole?: "tenant" | "landlord",
  ): Promise<void> {
    await this.model.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      lastMessageAt: new Date(),
      lastMessageSenderRole: senderRole,
    });
  }

  async findByUserId(userId: string): Promise<IConversation[]> {
    return this.model
      .find({
        $or: [{ tenantId: userId }, { landlordId: userId }],
      } as FilterQuery<IConversation>)
      .populate("tenantId", "firstName lastName avatar")
      .populate("landlordId", "firstName lastName avatar")
      .exec();
  }
}
