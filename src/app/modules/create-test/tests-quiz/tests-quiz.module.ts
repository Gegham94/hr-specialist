import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TestsQuizComponent} from "./tests-quiz.component";
import {UiModule} from "../../../ui-kit/ui.module";
import {TestsQuizRoutingModule} from "./tests-quiz-routing.module";
import {CreateTestModule} from "../create-test.module";

@NgModule({
  declarations: [TestsQuizComponent],
  imports: [CommonModule, UiModule, TestsQuizRoutingModule, CreateTestModule],
  exports: [TestsQuizComponent],
})
export class TestsQuizModule {
}
