import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {AnalyticsComponent} from "./analytics.component";
import {TestsListComponent} from "./tests-list/tests-list.component";
import {TestComponent} from "./tests-list/test/test.component";

const routes: Routes = [
  {
    path: "",
    component: AnalyticsComponent,
  },
  {
    path: "tests",
    component: TestsListComponent
  },
  {
    path: "tests/test",
    component: TestComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticRoutingModule {
}
