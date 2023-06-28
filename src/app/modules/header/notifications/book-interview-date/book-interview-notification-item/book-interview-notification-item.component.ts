import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from "@angular/core";
import {INotification,} from "../../../interfaces/notifications.interface";

@Component({
  selector: "hr-book-interview-notification-item",
  templateUrl: "./book-interview-notification-item.component.html",
  styleUrls: ["./book-interview-notification-item.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookInterviewNotificationItemComponent {
  //TODO - will be changed type of notification if it's necessary after api integration
  @Input("item") notificationItem!: INotification;
  @Input("hasNotification") hasNotification!: number;
  @Output() selectedNotification: EventEmitter<string> = new EventEmitter();
  public end = new Date();

  public selectNotification(uuid: string): void {
    this.selectedNotification.emit(uuid);
  }

}
