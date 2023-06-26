import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CompilerComponent } from "./compiler.component";
import { CompilerRoutingModule } from "./compiler-routing.module";
import { MonacoEditorModule } from "@materia-ui/ngx-monaco-editor";
import { UiModule } from "src/app/ui-kit/ui.module";
import { SelectBoxComponent } from "./select-box/select-box.component";
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [CompilerComponent, SelectBoxComponent],
  imports: [
    FormsModule,
    CommonModule,
    CompilerRoutingModule,
    MonacoEditorModule,
    UiModule,
  ],
  exports: [CompilerComponent, SelectBoxComponent],
  providers: [DatePipe]
})
export class CompilerModule {}
