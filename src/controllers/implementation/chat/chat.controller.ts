import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";
import { AuthRequest } from "../../../middleware/auth.middleware";

import type {
  StartConversationDto,
  SendMessageDto,
  GetMessagesDto,
} from "../../../dto/chat/chat.dto";
import type { IChatService } from "../../../services/interface/chat/IChatService";
import type { Request, Response } from "express";

@injectable()
export class ChatController {
  constructor(
    @inject(DI_TYPES.ChatService)
    private _chatService: IChatService,
  ) {}

  async startConversation(req: Request, res: Response): Promise<Response> {
    const dto = req.body as StartConversationDto;
    const conversation = await this._chatService.startConversation(dto);
    return res
      .status(HttpStatus.CREATED)
      .json(new ApiResponses(true, "Conversation started", conversation));
  }

  async sendMessage(req: Request, res: Response): Promise<Response> {
    const dto = req.body as SendMessageDto;
    const message = await this._chatService.sendMessage(dto);
    return res
      .status(HttpStatus.CREATED)
      .json(new ApiResponses(true, "Message sent", message));
  }

  async getLandlordConversations(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const landlordId = req.query.landlordId as string;
    const conversations =
      await this._chatService.getLandlordConversations(landlordId);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Conversations fetched", conversations));
  }

  async getTenantConversations(req: Request, res: Response): Promise<Response> {
    const tenantId = req.query.tenantId as string;
    const conversations =
      await this._chatService.getTenantConversations(tenantId);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Conversations fetched", conversations));
  }

  async getMessages(req: Request, res: Response): Promise<Response> {
    const dto: GetMessagesDto = {
      conversationId: req.query.conversationId as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    };
    const result = await this._chatService.getMessages(dto);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Messages fetched", result));
  }

  async markAsRead(req: Request, res: Response): Promise<Response> {
    const { conversationId, userId } = req.body as {
      conversationId: string;
      userId: string;
    };
    await this._chatService.markAsRead(conversationId, userId);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Marked as read"));
  }

  async uploadVoiceMessage(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(new ApiResponses(false, "User not authenticated"));
    }

    const file = req.file;
    if (!file) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "No audio file provided"));
    }

    const result = await this._chatService.uploadVoiceMessage(file, userId);

    return res
      .status(HttpStatus.OK)
      .json(
        new ApiResponses(true, "Voice message uploaded", { url: result.url }),
      );
  }

  async getCallHistory(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user?.userId;
    if (!userId)
      return res.status(401).json(new ApiResponses(false, "Unauthorized"));

    const result = await this._chatService.getCallHistory(userId);
    return res.status(200).json(new ApiResponses(true, "Call history", result));
  }
}
