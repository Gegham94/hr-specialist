import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {VacancyComponent} from "./vacancy.component";
import {AboutVacancyComponent} from "./about-vacancy/about-vacancy.component";

const routes: Routes = [
  {
    path: "",
    component: VacancyComponent,
  },
  {
    path: "about-vacancy",
    component: AboutVacancyComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class VacancyRoutingModule {
}
