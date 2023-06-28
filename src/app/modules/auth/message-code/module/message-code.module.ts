import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MessageCodeComponent} from "../message-code.component";
import {MessageTimeComponent} from "../message-time/message-time.component";
import {TranslateModule} from "@ngx-translate/core";
import {UiModule} from "../../../../ui-kit/ui.module";
import { SharedModule } from "src/app/shared/shared.module";


@NgModule({
  declarations: [
    MessageCodeComponent,
    MessageTimeComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UiModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule
  ],
  exports: [
    MessageCodeComponent,
    MessageTimeComponent
  ]
})
export class MessageCodeModule {}
