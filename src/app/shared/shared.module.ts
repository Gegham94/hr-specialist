import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { DatepickerDirective } from "./directives/datepicker.directive";
import { JwtInterceptor } from "./interceptors/jwt.interceptor";
import { FieldDirective } from "./directives/field.directive";
import { DateDifference } from "./pipes/date-difference.pipe";
import { LetDirective } from "./directives/ng-let.directive";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { RemoveTagPipe } from "./pipes/remove-tag.pipe";
import { PhonePipe } from "./pipes/phone.pipe";
import { CredentialsInterceptor } from "./interceptors/http.interceptor";
import { FooterComponent } from "../modules/footer/footer.component";
import { TranslateModule } from "@ngx-translate/core";
import { ReactiveFormsModule } from "@angular/forms";
import { DatepickerModule } from "ng2-datepicker";

@NgModule({
  declarations: [
    PhonePipe,
    RemoveTagPipe,
    DateDifference,
    DatepickerDirective,
    FieldDirective,
    LetDirective,
    FooterComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    DatepickerModule,
    ReactiveFormsModule,
  ],
  exports: [
    PhonePipe,
    RemoveTagPipe,
    DateDifference,
    DatepickerDirective,
    FieldDirective,
    LetDirective,
    FooterComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true },
  ],
})
export class SharedModule {}
