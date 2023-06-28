export type NotificationsOrNull = INotifications | null;

export interface INotifications {
  count: number;
  result: INotification[];
  unviewedCount: number;
}

export interface INotification {
  createdAt: string;
  info: INotificationInfo;
  recipientUuid: string;
  type: string;
  updatedAt: Date;
  uuid: string;
  viewed: boolean;
}

export interface INotificationInfo {
  content: string;
}
