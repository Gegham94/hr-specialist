import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { CompilerComponent } from "../compiler.component";
import { CompilerRoutingModule } from "./compiler-routing.module";
import { MonacoEditorModule } from "@materia-ui/ngx-monaco-editor";
import { UiModule } from "src/app/ui-kit/ui.module";
import { SelectBoxComponent } from "../select-box/select-box.component";
import { DatePipe } from "@angular/common";
import { CompilerTaskDetailsComponent } from "../components/compiler-task-details/compiler-task-details.component";
import { CompilerEditorComponent } from "../components/compiler-editor/compiler-editor.component";
import { CompilerFooterComponent } from "../components/compiler-footer/compiler-footer.component";
import { CompilerHeaderComponent } from "../components/compiler-header/compiler-header.component";

@NgModule({
  declarations: [
    CompilerComponent,
    SelectBoxComponent,
    CompilerHeaderComponent,
    CompilerFooterComponent,
    CompilerEditorComponent,
    CompilerTaskDetailsComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    TranslateModule,
    CompilerRoutingModule,
    MonacoEditorModule,
    UiModule
  ],
  exports: [CompilerComponent, SelectBoxComponent],
  providers: [DatePipe],
})
export class CompilerModule {}
