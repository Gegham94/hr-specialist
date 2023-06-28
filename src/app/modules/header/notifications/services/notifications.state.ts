import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { INotification } from "../../interfaces/notifications.interface";

@Injectable({
  providedIn: "root"
})
export class NotificationsState {
  private notifications$: BehaviorSubject<INotification[]> = new BehaviorSubject<INotification[]>([]);
  private bookInterviewNotifications$: BehaviorSubject<INotification[]> = new BehaviorSubject<INotification[]>([]);

  public getNotifications$(): Observable<INotification[]> {
    return this.notifications$.asObservable();
  }

  public setNotifications$(notifications: INotification[]): void {
    this.notifications$.next(notifications);
  }

  public getBookInterviewNotifications$(): Observable<INotification[]> {
    return this.bookInterviewNotifications$.asObservable();
  }

  public setBookInterviewNotifications$(notifications: INotification[]): void {
    this.bookInterviewNotifications$.next(notifications);
  }
}
