import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import {INotification} from "../../../interfaces/notifications.interface";

@Component({
  selector: "hr-notification-item",
  templateUrl: "./notification-item.component.html",
  styleUrls: ["./notification-item.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationItemComponent {
  @Input("item") notificationItem!: INotification;
  @Input("hasNotification") hasNotification!: number;
  @Output() selectedNotification: EventEmitter<string> = new EventEmitter();
  public end = new Date();

  public selectNotification(uuid: string): void {
    this.selectedNotification.emit(uuid);
  }
}
