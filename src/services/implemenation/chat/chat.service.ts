import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { uploadToS3 } from "../../../config/s3";
import {
  ChatMapper,
  ConversationResponseDto,
  MessageResponseDto,
} from "../../../mappers/chat.mapper";
import logger from "../../../utils/logger";

import type {
  StartConversationDto,
  SendMessageDto,
  GetMessagesDto,
  VoiceMessageDto,
} from "../../../dto/chat/chat.dto";
import type { IConversationRepository } from "../../../repositories/interface/IConversationRepository";
import type { IMessageRepository } from "../../../repositories/interface/IMessageRepository";
import type {
  IChatService,
  GetMessagesResult,
} from "../../interface/chat/IChatService";

@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject(DI_TYPES.ConversationRepository)
    private _convRepo: IConversationRepository,

    @inject(DI_TYPES.MessageRepository)
    private _msgRepo: IMessageRepository,
  ) {}

  // async startConversation(dto: StartConversationDto): Promise<IConversation> {
  //   const existing = await this._convRepo.findByParticipants(
  //     dto.tenantId,
  //     dto.landlordId,
  //   );

  //   if (existing) {
  //     // Conversation exists — but check if it has any messages
  //     // If no messages yet, create the first one from inquiry
  //     if (dto.message) {
  //       const messageCount = await this._msgRepo.countByConversationId(
  //         String(existing._id),
  //       );

  //       if (messageCount === 0) {
  //         await this._msgRepo.createMessage({
  //           conversationId: String(existing._id),
  //           senderId: dto.tenantId,
  //           senderRole: "tenant",
  //           content: dto.message,
  //           isRead: false,
  //         });
  //         await this._convRepo.updateLastMessage(
  //           String(existing._id),
  //           dto.message,
  //         );
  //       }
  //     }
  //     return existing;
  //   }

  //   // New conversation
  //   const conversation = await this._convRepo.createConversation({
  //     tenantId: dto.tenantId,
  //     landlordId: dto.landlordId,
  //     ...(dto.inquiryId && { inquiryId: dto.inquiryId }),
  //   });

  //   if (dto.message) {
  //     await this._msgRepo.createMessage({
  //       conversationId: String(conversation._id),
  //       senderId: dto.tenantId,
  //       senderRole: "tenant",
  //       content: dto.message,
  //       isRead: false,
  //     });
  //     await this._convRepo.updateLastMessage(
  //       String(conversation._id),
  //       dto.message,
  //     );
  //   }

  //   return conversation;
  // }

  // async sendMessage(dto: SendMessageDto): Promise<IMessage> {
  //   const conversation = await this._convRepo.findById(dto.conversationId);
  //   if (!conversation) {
  //     throw new AppError("Conversation not found", HttpStatus.NOT_FOUND);
  //   }

  //   const message = await this._msgRepo.createMessage({
  //     conversationId: dto.conversationId,
  //     senderId: dto.senderId,
  //     senderRole: dto.senderRole,
  //     content: dto.content,
  //     isRead: false,
  //   });

  //   await this._convRepo.updateLastMessage(dto.conversationId, dto.content);
  //   return message;
  // }

  // async getLandlordConversations(landlordId: string): Promise<IConversation[]> {
  //   return this._convRepo.findByLandlordId(landlordId);
  // }

  // async getTenantConversations(tenantId: string): Promise<IConversation[]> {
  //   return this._convRepo.findByTenantId(tenantId);
  // }

  async startConversation(
    dto: StartConversationDto,
  ): Promise<ConversationResponseDto> {
    const existing = await this._convRepo.findByParticipants(
      dto.tenantId,
      dto.landlordId,
    );

    if (existing) {
      if (dto.message) {
        const messageCount = await this._msgRepo.countByConversationId(
          String(existing._id),
        );

        if (messageCount === 0) {
          await this._msgRepo.createMessage({
            conversationId: String(existing._id),
            senderId: dto.tenantId,
            senderRole: "tenant",
            content: dto.message,
            isRead: false,
          });
          await this._convRepo.updateLastMessage(
            String(existing._id),
            dto.message,
          );
        }
      }

      const unreadCount = await this._msgRepo.countUnread(
        String(existing._id),
        dto.tenantId,
      );
      return ChatMapper.toConversationDto(existing, unreadCount);
    }

    const conversation = await this._convRepo.createConversation({
      tenantId: dto.tenantId,
      landlordId: dto.landlordId,
      ...(dto.inquiryId && { inquiryId: dto.inquiryId }),
    });

    if (dto.message) {
      await this._msgRepo.createMessage({
        conversationId: String(conversation._id),
        senderId: dto.tenantId,
        senderRole: "tenant",
        content: dto.message,
        isRead: false,
      });
      await this._convRepo.updateLastMessage(
        String(conversation._id),
        dto.message,
      );
    }

    return ChatMapper.toConversationDto(conversation, 0);
  }

  async sendMessage(dto: SendMessageDto): Promise<MessageResponseDto> {
    const conversation = await this._convRepo.findById(dto.conversationId);
    if (!conversation) {
      throw new AppError("Conversation not found", HttpStatus.NOT_FOUND);
    }

    const message = await this._msgRepo.createMessage({
      conversationId: dto.conversationId,
      senderId: dto.senderId,
      senderRole: dto.senderRole,
      content: dto.content,
      isRead: false,
    });

    await this._convRepo.updateLastMessage(
      dto.conversationId,
      dto.content,
      dto.senderRole,
    );
    return ChatMapper.toMessageDto(message);
  }

  async getLandlordConversations(
    landlordId: string,
  ): Promise<ConversationResponseDto[]> {
    const conversations = await this._convRepo.findByLandlordId(landlordId);
    const unreadCounts = await Promise.all(
      conversations.map((conv) =>
        this._msgRepo.countUnread(String(conv._id), landlordId),
      ),
    );
    return ChatMapper.toConversationDtoList(conversations, unreadCounts);
  }

  async getTenantConversations(
    tenantId: string,
  ): Promise<ConversationResponseDto[]> {
    const conversations = await this._convRepo.findByTenantId(tenantId);
    const unreadCounts = await Promise.all(
      conversations.map((conv) =>
        this._msgRepo.countUnread(String(conv._id), tenantId),
      ),
    );
    return ChatMapper.toConversationDtoList(conversations, unreadCounts);
  }

  async getMessages(dto: GetMessagesDto): Promise<GetMessagesResult> {
    const skip = (dto.page - 1) * dto.limit;
    const [messages, total] = await Promise.all([
      this._msgRepo.findByConversationId(dto.conversationId, skip, dto.limit),
      this._msgRepo.countByConversationId(dto.conversationId),
    ]);
    return {
      messages: ChatMapper.toMessageDtoList(messages),
      total,
      page: dto.page,
      limit: dto.limit,
    };
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this._msgRepo.markAsRead(conversationId, userId);
  }

  async uploadVoiceMessage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<VoiceMessageDto> {
    logger.info("Voice message upload processing", { userId });

    const url = await uploadToS3(file, "voice-messages", userId);

    logger.info("Voice message uploaded to S3", { userId, url });

    return { url };
  }

  async getCallHistory(userId: string): Promise<MessageResponseDto[]> {
    const conversations = await this._convRepo.findByUserId(userId);
    const convIds = conversations.map((c) => String(c._id));

    if (convIds.length === 0) return [];

    const messages = await this._msgRepo.findCallMessages(convIds);
    return ChatMapper.toMessageDtoList(messages);
  }
}
