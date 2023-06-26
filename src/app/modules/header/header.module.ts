import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HeaderComponent } from "./header.component";
import { ClickOutsideModule } from "ng-click-outside";
import { RouterModule } from "@angular/router";
import { UiModule } from "../../ui-kit/ui.module";
import { TranslateModule } from "@ngx-translate/core";
import { NotificationsModule } from "./notifications/notifications.module";
import { NgxIndexedDBModule } from "ngx-indexed-db";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [HeaderComponent],
  exports: [HeaderComponent],
  imports: [
    CommonModule,
    ClickOutsideModule,
    UiModule,
    RouterModule,
    NotificationsModule,
    TranslateModule,
    NgxIndexedDBModule,
    SharedModule,
  ],
})
export class HeaderModule {}
