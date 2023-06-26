import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {HomeLayoutComponent} from "./home-layout/home-layout.component";

const routes: Routes = [
  {
    path: "employee",
    component: HomeLayoutComponent,
    children: [
      {
        path: "resume",
        loadChildren: () => import("../modules/profile/profile.module").then(m => m.ProfileModule)
      },
      {
        path: "search",
        loadChildren: () => import("./search-job/search.module").then(m => m.SearchModule)
      },
      {
        path: "analytics",
        loadChildren: () => import("./analytic/analytic.module").then(m => m.AnalyticModule)
      },
      {
        path: "chat",
        loadChildren: () => import("../modules/chat/chat.module").then(m => m.ChatModule)
      },
      {
        path: "create-test",
        loadChildren: () => import("../modules/create-test/create-test.module").then(m => m.CreateTestModule)
      },
      {
        path: "create-test/compiler-test",
        loadChildren: () => import("../modules/create-test/compiler/compiler.module").then((m) => m.CompilerModule),
      },
      {
        path: "create-test/quiz-test",
        loadChildren: () => import("../modules/create-test/quiz/quiz.module").then((m) => m.QuizModule),
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule {
}
