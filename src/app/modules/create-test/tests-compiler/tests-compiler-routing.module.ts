import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {TestsCompilerComponent} from "./tests-compiler.component";

const routes: Routes = [
  {
    path: "",
    component: TestsCompilerComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class TestsCompilerRoutingModule {
}
