import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {Observable} from "rxjs";
import {GlobalNotification, NotificationOrNull} from "../interfaces/notifications.interface";
import {SearchParams} from "../../employee-info/interface/search-params";
import {SocketService} from "../../chat/socket.service";


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

  public getCompanyNotificationHandler$(): Observable<NotificationOrNull> {
    return this._chatSocketService.getSocket().fromEvent("getCompanyNotification");
  }

  public getCompanyNotificationRequest$(recipientUuid: string): Observable<NotificationOrNull> {
    return this._httpClient.get<NotificationOrNull>(this.GET_NOTIFICATIONS_API, {
      params: {
        recipientUuid
      }
    });
  }

  public getGlobalNotification$(pagination: SearchParams): Observable<GlobalNotification> {
    return this._httpClient.get<GlobalNotification>(`${this.globalNotification}/notification/global`,
      {params: {...pagination}});
  }

  public updateViewedNotification$(uuid: string): Observable<any> {
    // @ts-ignore
    return this._httpClient.put<any>(`${this.globalNotification}/notification/global/${uuid}`);
  }
}
