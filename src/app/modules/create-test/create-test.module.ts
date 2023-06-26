import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {CreateTestComponent} from "./create-test.component";
import {UiModule} from "../../ui-kit/ui.module";
import {CreateTestRoutingModule} from "./create-test-routing.module";
import {OldSharedModule} from "../../shared-modules/shared.module";
import {FilterTestComponent} from "./filter-test/filter-test.component";
import {TranslateModule} from "@ngx-translate/core";
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";

@NgModule({
  declarations: [CreateTestComponent, FilterTestComponent],
  imports: [CommonModule, UiModule, OldSharedModule, CreateTestRoutingModule, TranslateModule, ReactiveFormsModule, SharedModule],
  exports: [CreateTestComponent, FilterTestComponent],
})
export class CreateTestModule {
}
