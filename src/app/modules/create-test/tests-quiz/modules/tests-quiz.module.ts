import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TestsQuizComponent} from "../tests-quiz.component";
import {UiModule} from "../../../../ui-kit/ui.module";
import {TestsQuizRoutingModule} from "./tests-quiz-routing.module";
import {CreateTestModule} from "../../modules/create-test.module";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [TestsQuizComponent],
  imports: [CommonModule, UiModule, TestsQuizRoutingModule, CreateTestModule, TranslateModule],
  exports: [TestsQuizComponent],
})
export class TestsQuizModule {
}
