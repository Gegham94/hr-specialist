import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";
import {Observable} from "rxjs";
import {INotifications, NotificationsOrNull} from "../../interfaces/notifications.interface";
import {SocketService} from "../../../chat/services/socket.service";
import {SearchParams} from "src/app/modules/profile/interfaces/search-params";


@Injectable({
  providedIn: "root"
})
export class NotificationsService {

  private readonly GET_NOTIFICATIONS_API = `${environment.notificationUrl}/notification`;
  private readonly globalNotification = environment.notification;

  constructor(
    private readonly _chatSocketService: SocketService,
    private readonly _httpClient: HttpClient
  ) {
  }

  public getCompanyNotificationHandler$(): Observable<NotificationsOrNull> {
    return this._chatSocketService.getSocket().fromEvent("getCompanyNotification");
  }

  public getCompanyNotificationRequest$(recipientUuid: string): Observable<NotificationsOrNull> {
    return this._httpClient.get<NotificationsOrNull>(this.GET_NOTIFICATIONS_API, {
      params: {
        recipientUuid
      }
    });
  }

  public getGlobalNotification$(pagination: SearchParams): Observable<INotifications> {
    return this._httpClient.get<INotifications>(`${this.globalNotification}/notification/global`,
      {params: {...pagination}});
  }

  public updateViewedNotification$(uuid: string): Observable<any> {
    // @ts-ignore
    return this._httpClient.put<any>(`${this.globalNotification}/notification/global/${uuid}`);
  }
}
