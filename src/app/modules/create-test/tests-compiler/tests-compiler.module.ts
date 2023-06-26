import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TestsCompilerComponent} from "./tests-compiler.component";
import {UiModule} from "../../../ui-kit/ui.module";
import {TestsCompilerRoutingModule} from "./tests-compiler-routing.module";
import {CreateTestModule} from "../create-test.module";

@NgModule({
  declarations: [TestsCompilerComponent],
  imports: [CommonModule, UiModule, TestsCompilerRoutingModule, CreateTestModule],
  exports: [TestsCompilerComponent],
})
export class TestsCompilerModule {
}
