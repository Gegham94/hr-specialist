import { NgModule } from "@angular/core";
import { AsyncPipe, CommonModule } from "@angular/common";
import { UiModule } from "../../ui-kit/ui.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ImageCropperModule } from "ngx-image-cropper";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { EmployeeInfoComponent } from "./components/employee-info.component";
import { EmployeeInfoRoutingModule } from "./employee-info-routing.module";
import { TranslateModule } from "@ngx-translate/core";
import { ResumeComponent } from "./components/resume/resume.component";
import { NgxMaskModule } from "ngx-mask";

@NgModule({
  declarations: [EmployeeInfoComponent, ResumeComponent],
  exports: [EmployeeInfoComponent],
  imports: [
    CommonModule,
    EmployeeInfoRoutingModule,
    UiModule,
    FormsModule,
    ReactiveFormsModule,
    ImageCropperModule,
    CKEditorModule,
    TranslateModule,
    NgxMaskModule,
  ],
  providers: [AsyncPipe],
})
export class EmployeeInfoModule {}
