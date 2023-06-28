import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {AboutCompanyComponent} from "../about-company/about-company.component";
import {CompanyComponent} from "../company.component";

const routes: Routes = [
  {
    path: "",
    component: CompanyComponent,
  },
  {
    path:"about-company",
    component:AboutCompanyComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CompanyRoutingModule {
}
