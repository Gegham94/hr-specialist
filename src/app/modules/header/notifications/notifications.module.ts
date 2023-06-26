import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {UiModule} from "../../../ui-kit/ui.module";
import {NotificationItemComponent} from "./notification/notification-item/notification-item.component";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {NotificationComponent} from "./notification/notification.component";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {SharedModule} from "src/app/shared/shared.module";
import {BookInterviewNotificationComponent} from "./book-interview-date/book-interview-notification.component";
import {
  BookInterviewNotificationItemComponent
} from "./book-interview-date/book-interview-notification-item/book-interview-notification-item.component";
import {NgbDatepickerModule} from "@ng-bootstrap/ng-bootstrap";
import {
  BookInterviewDateHoursComponent
} from "./book-interview-date/book-interview/book-interview-date-hours/book-interview-date-hours.component";
import {BookInterviewComponent} from "./book-interview-date/book-interview/book-interview.component";

@NgModule({
  declarations: [
    NotificationComponent,
    NotificationItemComponent,
    BookInterviewNotificationComponent,
    BookInterviewNotificationItemComponent,
    BookInterviewDateHoursComponent,
    BookInterviewComponent
  ],
  imports: [
    UiModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    InfiniteScrollModule,
    ScrollingModule,
    SharedModule,
    NgbDatepickerModule,
    ReactiveFormsModule
  ],
  exports: [NotificationComponent, BookInterviewNotificationComponent],
  providers: [],
})
export class NotificationsModule {
}
