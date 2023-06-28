import {Injectable} from "@angular/core";
import {filter, map, Observable, takeUntil} from "rxjs";

import {NotificationsState} from "./notifications.state";
import {INotification, INotifications} from "../../interfaces/notifications.interface";
import {NotificationsService} from "./notifications.service";
import { SearchParams } from "src/app/modules/profile/interfaces/search-params";

@Injectable({
  providedIn: "root",
})
export class NotificationsFacade {
  constructor(
    private readonly _notificationState: NotificationsState,
    private readonly _notificationsService: NotificationsService
  ) {
  }

  public getNotificationsRequest$(pagination: SearchParams): Observable<INotifications> {
    return this._notificationsService.getGlobalNotification$(pagination);
  }

  public getBookInterviewNotificationsRequest$(pagination: SearchParams): Observable<INotifications> {
    return this._notificationsService.getGlobalNotification$(pagination);
  }

  public getNotifications$(): Observable<INotification[]> {
    return this._notificationState.getNotifications$();
  }

  public setNotifications$(notifications: INotification[]): void {
    this._notificationState.setNotifications$(notifications);
  }

  public updateViewedNotification$(uuid: string) {
    return this._notificationsService.updateViewedNotification$(uuid)
      .pipe(filter((viewNot) => viewNot["affected"] >= 1), map(data => data));
  }


  public getBookInterviewNotifications$(): Observable<INotification[]> {
    return this._notificationState.getBookInterviewNotifications$();
  }

  public setBookInterviewNotifications$(notifications: INotification[]): void {
    this._notificationState.setBookInterviewNotifications$(notifications);
  }
}
