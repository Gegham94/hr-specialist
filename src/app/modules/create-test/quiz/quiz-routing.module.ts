import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { QuizComponent } from "./quiz.component";
import { QuizTestsLeaveGuard } from "../../../shared/guards/quiz-tests-leave.guard";

const routes: Routes = [
  {
    path: "",
    component: QuizComponent,
    canDeactivate: [QuizTestsLeaveGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuizRoutingModule {}
