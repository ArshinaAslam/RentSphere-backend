import type {
  StartConversationDto,
  SendMessageDto,
  GetMessagesDto,
  VoiceMessageDto,
} from "../../../dto/chat/chat.dto";
import type {
  ConversationResponseDto,
  MessageResponseDto,
} from "../../../mappers/chat.mapper";

export interface GetMessagesResult {
  messages: MessageResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface IChatService {
  startConversation(
    dto: StartConversationDto,
  ): Promise<ConversationResponseDto>;
  sendMessage(dto: SendMessageDto): Promise<MessageResponseDto>;
  getLandlordConversations(
    landlordId: string,
  ): Promise<ConversationResponseDto[]>;
  getTenantConversations(tenantId: string): Promise<ConversationResponseDto[]>;
  getMessages(dto: GetMessagesDto): Promise<GetMessagesResult>;
  markAsRead(conversationId: string, userId: string): Promise<void>;
  uploadVoiceMessage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<VoiceMessageDto>;

  getCallHistory(userId: string): Promise<MessageResponseDto[]>;
}
