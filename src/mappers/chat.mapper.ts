import type { IConversation } from "../models/conversationModel";
import type { IMessage } from "../models/messageModel";

export interface ConversationResponseDto {
  _id: string;
  tenantId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string | undefined;
  };
  landlordId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string | undefined;
  };
  inquiryId?: string | undefined;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSenderRole?: "tenant" | "landlord" | undefined;
  unreadCount: number;
  status: string;
}

export interface MessageResponseDto {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface PopulatedParticipant {
  _id: unknown;
  firstName: string;
  lastName: string;
  avatar?: string;
}

function isPopulatedParticipant(value: unknown): value is PopulatedParticipant {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    "firstName" in value &&
    "lastName" in value
  );
}

export class ChatMapper {
  static toConversationDto(
    conv: IConversation,
    unreadCount: number,
  ): ConversationResponseDto {
    const tenantId = conv.tenantId;
    const landlordId = conv.landlordId;

    if (!isPopulatedParticipant(tenantId)) {
      throw new Error("tenantId is not populated on conversation");
    }
    if (!isPopulatedParticipant(landlordId)) {
      throw new Error("landlordId is not populated on conversation");
    }

    return {
      _id: String(conv._id),
      tenantId: {
        _id: String(tenantId._id),
        firstName: tenantId.firstName,
        lastName: tenantId.lastName,
        avatar: tenantId.avatar,
      },
      landlordId: {
        _id: String(landlordId._id),
        firstName: landlordId.firstName,
        lastName: landlordId.lastName,
        avatar: landlordId.avatar,
      },
      inquiryId: conv.inquiryId ? String(conv.inquiryId) : undefined,
      lastMessage: conv.lastMessage ?? "",
      lastMessageAt: conv.lastMessageAt
        ? new Date(conv.lastMessageAt).toISOString()
        : new Date().toISOString(),
      lastMessageSenderRole: conv.lastMessageSenderRole,
      unreadCount,
      status: conv.status ?? "active",
    };
  }

  static toConversationDtoList(
    convs: IConversation[],
    unreadCounts: number[],
  ): ConversationResponseDto[] {
    return convs.map((conv, i) =>
      ChatMapper.toConversationDto(conv, unreadCounts[i] ?? 0),
    );
  }

  static toMessageDto(msg: IMessage): MessageResponseDto {
    return {
      _id: String(msg._id),
      conversationId: String(msg.conversationId),
      senderId: String(msg.senderId),
      senderRole: msg.senderRole,
      content: msg.content,
      isRead: msg.isRead,
      createdAt: new Date(msg.createdAt).toISOString(),
    };
  }

  static toMessageDtoList(msgs: IMessage[]): MessageResponseDto[] {
    return msgs.map((msg) => ChatMapper.toMessageDto(msg));
  }
}
