import type { IConversation } from "../../models/conversationModel";

export interface IConversationRepository {
  findByParticipants(
    tenantId: string,
    landlordId: string,
  ): Promise<IConversation | null>;
  createConversation(data: Partial<IConversation>): Promise<IConversation>;
  findByLandlordId(landlordId: string): Promise<IConversation[]>;
  findByTenantId(tenantId: string): Promise<IConversation[]>;
  updateLastMessage(
    conversationId: string,
    message: string,
    senderRole?: "tenant" | "landlord",
  ): Promise<void>;
  findById(conversationId: string): Promise<IConversation | null>;
  findByUserId(userId: string): Promise<IConversation[]>;
}
