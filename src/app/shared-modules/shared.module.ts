import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { DatepickerModule } from "ng2-datepicker";

import { FilterComponent } from "./components/filter/filter.component";
import { UiModule } from "../ui-kit/ui.module";

@NgModule({
  declarations: [FilterComponent],
  exports: [FilterComponent],
  imports: [CommonModule, UiModule, DatepickerModule, ReactiveFormsModule],
})
export class OldSharedModule {}
