import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { MessageCodeModule } from "../../message-code/module/message-code.module";
import { SignInRoutingModule } from "./signin-routing.module";
import { HeaderModule } from "../../../header/header.module";
import { UiModule } from "../../../../ui-kit/ui.module";
import { SigninComponent } from "../signin.component";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [SigninComponent],
  imports: [
    CommonModule,
    SharedModule,
    SignInRoutingModule,
    UiModule,
    HeaderModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MessageCodeModule,
  ],
  exports: [SigninComponent],
})
export class SignInModule {}
