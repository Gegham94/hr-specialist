import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {CreateTestComponent} from "./create-test.component";

const routes: Routes = [
  {
    path: "",
    component: CreateTestComponent,
    children: [
      {
        path: "compiler",
        loadChildren: () => import("./tests-compiler/tests-compiler.module").then(m => m.TestsCompilerModule)
      },
      {
        path: "quiz",
        loadChildren: () => import("./tests-quiz/tests-quiz.module").then(m => m.TestsQuizModule)
      },
    ]
  },
  {
    path: "quiz-test",
    loadChildren: () => import("./quiz/quiz.module").then(m => m.QuizModule)
  },
  {
    path: "compiler-test",
    loadChildren: () => import("./compiler/compiler.module").then(m => m.CompilerModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CreateTestRoutingModule {
}
