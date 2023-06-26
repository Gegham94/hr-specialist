import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {SearchComponent} from "./search.component";

const routes: Routes = [
  {
    path: "",
    component: SearchComponent,
    children: [
      {
        path: "company",
        loadChildren: () => import("./company/company.module").then(m => m.CompanyModule)
      },
      {
        path: "vacancy",
        loadChildren: () => import("./vacancy/vacancy.module").then(m => m.VacancyModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SearchRoutingModule {
}
