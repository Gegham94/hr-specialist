import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {EmployeeInfoComponent} from "./components/employee-info.component";
import {ResumeComponent} from "./components/resume/resume.component";


const routes: Routes = [
  {
    path: "",
    component: ResumeComponent,
  },
  {
    path: "edit",
    component: EmployeeInfoComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeInfoRoutingModule {
}
