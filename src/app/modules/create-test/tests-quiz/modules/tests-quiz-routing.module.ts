import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {TestsQuizComponent} from "../tests-quiz.component";

const routes: Routes = [
  {
    path: "",
    component: TestsQuizComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class TestsQuizRoutingModule {
}
