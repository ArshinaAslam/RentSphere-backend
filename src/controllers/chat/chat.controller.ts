import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import { AuthRequest } from "../../middleware/auth.middleware";

import type {
  StartConversationDto,
  SendMessageDto,
  GetMessagesDto,
} from "../../dto/chat/chat.dto";
import type { IChatService } from "../../services/interface/chat/IChatService";
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
      .json(
        ApiResponses.success(conversation, MESSAGES.CHAT.CONVERSATION_STARTED),
      );
  }

  async sendMessage(req: Request, res: Response): Promise<Response> {
    const dto = req.body as SendMessageDto;
    const message = await this._chatService.sendMessage(dto);

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponses.success(message, MESSAGES.CHAT.MESSAGE_SENT));
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
      .json(
        ApiResponses.success(
          conversations,
          MESSAGES.CHAT.CONVERSATIONS_FETCHED,
        ),
      );
  }

  async getTenantConversations(req: Request, res: Response): Promise<Response> {
    const tenantId = req.query.tenantId as string;
    const conversations =
      await this._chatService.getTenantConversations(tenantId);

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponses.success(
          conversations,
          MESSAGES.CHAT.CONVERSATIONS_FETCHED,
        ),
      );
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
      .json(ApiResponses.success(result, MESSAGES.CHAT.MESSAGES_FETCHED));
  }

  async markAsRead(req: Request, res: Response): Promise<Response> {
    const { conversationId, userId } = req.body as {
      conversationId: string;
      userId: string;
    };

    await this._chatService.markAsRead(conversationId, userId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(null, MESSAGES.CHAT.MARKED_READ));
  }

  async uploadVoiceMessage(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.CHAT.USER_NOT_AUTHENTICATED));
    }

    const file = req.file;
    if (!file) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.CHAT.NO_AUDIO));
    }

    const result = await this._chatService.uploadVoiceMessage(file, userId);

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponses.success({ url: result.url }, MESSAGES.CHAT.VOICE_UPLOADED),
      );
  }

  async getCallHistory(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user?.userId;

    if (!userId)
      return res
        .status(401)
        .json(ApiResponses.error(MESSAGES.CHAT.UNAUTHORIZED));

    const result = await this._chatService.getCallHistory(userId);

    return res
      .status(200)
      .json(ApiResponses.success(result, MESSAGES.CHAT.CALL_HISTORY));
  }

  async uploadAttachment(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user?.userId;

    if (!userId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.CHAT.UNAUTHORIZED));

    const file = req.file;

    if (!file)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.CHAT.NO_FILE));

    const result = await this._chatService.uploadAttachment(file, userId);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(result, MESSAGES.CHAT.FILE_UPLOADED));
  }
}
