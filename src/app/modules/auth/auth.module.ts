import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AuthRoutingModule} from "./auth-routing.module";
import {UiModule} from "../../ui-kit/ui.module";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthComponent} from "./auth.component";
import {MessageCodeModule} from "./message-code/message-code.module";
import {HeaderModule} from "../header/header.module";

@NgModule({
  declarations: [
    AuthComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    UiModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    MessageCodeModule
  ],
  exports: [
    AuthComponent
  ]
})
export class AuthModule {
}
