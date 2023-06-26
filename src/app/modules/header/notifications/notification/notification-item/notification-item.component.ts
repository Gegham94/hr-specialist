import { Component, EventEmitter, Input, Output } from "@angular/core";
import { GlobalNotificationItem } from "../../../interfaces/notifications.interface";

@Component({
  selector: "hr-notification-item",
  templateUrl: "./notification-item.component.html",
  styleUrls: ["./notification-item.component.scss"],
})
export class NotificationItemComponent {
  @Input("item") notificationItem!: GlobalNotificationItem;
  @Input("hasNotification") hasNotification!: number;
  @Output() selectedNotification: EventEmitter<string> = new EventEmitter();
  public end = new Date();

  public selectNotification(uuid: string): void {
    this.selectedNotification.emit(uuid);
  }
}
