import type {
  NotificationType,
  RecipientRole,
} from "../../models/notificationModel";

export interface CreateNotificationDto {
  recipientId: string;
  recipientRole: RecipientRole;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}
