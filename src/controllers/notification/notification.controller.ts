import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";

import type { AuthRequest } from "../../middleware/auth.middleware";
import type { NotificationService } from "../../services/implemenation/notification/notification.service";

@injectable()
export class NotificationController {
  constructor(
    @inject(DI_TYPES.NotificationService)
    private _service: NotificationService,
  ) {}

  async getMyNotifications(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.NOTIFICATION.UNAUTHORIZED));

    const notifications = await this._service.getMyNotifications(userId);

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponses.success(
          { notifications },
          MESSAGES.NOTIFICATION.FETCH_SUCCESS,
        ),
      );
  }

  async getUnreadCount(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.NOTIFICATION.UNAUTHORIZED));

    const count = await this._service.getUnreadCount(userId);

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponses.success({ count }, MESSAGES.NOTIFICATION.COUNT_SUCCESS),
      );
  }

  async markAsRead(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId || !notificationId)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.NOTIFICATION.BAD_REQUEST));

    await this._service.markAsRead(notificationId, userId);

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponses.success(null, MESSAGES.NOTIFICATION.MARK_READ_SUCCESS),
      );
  }

  async markAllAsRead(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user?.userId;

    if (!userId)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ApiResponses.error(MESSAGES.NOTIFICATION.UNAUTHORIZED));

    await this._service.markAllAsRead(userId);

    return res
      .status(HttpStatus.OK)
      .json(
        ApiResponses.success(null, MESSAGES.NOTIFICATION.MARK_ALL_READ_SUCCESS),
      );
  }
}
