import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { NotificationsState } from "./notifications.state";
import { NotificationOrNull } from "../interfaces/notifications.interface";

@Injectable({
  providedIn: "root",
})
export class NotificationsFacade {
  constructor(private readonly _notificationState: NotificationsState) {}

  public getNotification$(): Observable<NotificationOrNull> {
    return this._notificationState.getNotification$();
  }

  public getCompanyNotifications$(): Observable<NotificationOrNull> {
    return this._notificationState.getCompanyNotification$();
  }
}
