export interface StartConversationDto {
  tenantId: string;
  landlordId: string;

  inquiryId?: string;
  message?: string;
}

export interface SendMessageDto {
  conversationId: string;
  senderId: string;
  senderRole: "tenant" | "landlord";
  content: string;
}

export interface GetMessagesDto {
  conversationId: string;
  page: number;
  limit: number;
}
export interface VoiceMessageDto {
  url: string;
}
