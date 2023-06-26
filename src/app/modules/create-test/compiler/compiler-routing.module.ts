import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CompilerComponent } from "./compiler.component";
import { CompilerTestsLeaveGuard } from "../../../shared/guards/compiler-tests-leave.guard";

const routes: Routes = [
  {
    path: "",
    component: CompilerComponent,
    canDeactivate: [CompilerTestsLeaveGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompilerRoutingModule {}
