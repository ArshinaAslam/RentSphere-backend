import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { CreateNotificationDto } from "../../../dto/notification/notification.dto";
import { NotificationMapper } from "../../../mappers/notification.mapper";
import logger from "../../../utils/logger";
import { INotificationService } from "../../interface/notification/INotificationService";

import type { NotificationResponseDto } from "../../../mappers/notification.mapper";
import type { INotificationRepository } from "../../../repositories/interface/INotificationRepository";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(DI_TYPES.NotificationRepository)
    private _repo: INotificationRepository,
  ) {}

  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    if (!dto.recipientId || !dto.type || !dto.title || !dto.message)
      throw new AppError(
        MESSAGES.NOTIFICATION.REQUIRED_FIELDS,
        HttpStatus.BAD_REQUEST,
      );

    logger.info("Creating notification", {
      recipientId: dto.recipientId,
    });

    const notification = await this._repo.create(dto);

    logger.info("Notification created", {
      notificationId: String(notification._id),
    });

    return NotificationMapper.toDto(notification);
  }

  async getMyNotifications(
    recipientId: string,
  ): Promise<NotificationResponseDto[]> {
    if (!recipientId)
      throw new AppError(
        MESSAGES.NOTIFICATION.RECIPIENT_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );

    logger.info("Fetching notifications", { recipientId });

    const notifications = await this._repo.findByRecipient(recipientId);

    return NotificationMapper.toDtoList(notifications);
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    if (!recipientId)
      throw new AppError(
        MESSAGES.NOTIFICATION.RECIPIENT_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );

    return this._repo.countUnread(recipientId);
  }

  async markAsRead(notificationId: string, recipientId: string): Promise<void> {
    if (!notificationId || !recipientId)
      throw new AppError(
        MESSAGES.NOTIFICATION.MARK_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );

    logger.info("Marking notification as read", {
      notificationId,
      recipientId,
    });

    await this._repo.markAsRead(notificationId, recipientId);
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    if (!recipientId)
      throw new AppError(
        MESSAGES.NOTIFICATION.RECIPIENT_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );

    logger.info("Marking all notifications as read", { recipientId });

    await this._repo.markAllAsRead(recipientId);
  }
}
