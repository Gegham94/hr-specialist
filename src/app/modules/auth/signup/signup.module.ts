import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SignupRoutingModule } from "./signup-routing.module";
import { UiModule } from "../../../ui-kit/ui.module";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {SignupComponent} from "./signup.component";
import {TranslateModule} from "@ngx-translate/core";
import {SignInModule} from "../signin/signin.module";
import {HeaderModule} from "../../header/header.module";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [
    SignupComponent,
  ],
  imports: [
    CommonModule,
    SignupRoutingModule,
    UiModule,
    HeaderModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SignInModule,
    SharedModule
  ],
  exports:[
    SignupComponent,
  ]
})
export class SignUpModule { }
