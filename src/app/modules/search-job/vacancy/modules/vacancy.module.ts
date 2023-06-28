import {NgModule} from "@angular/core";
import {VacancyComponent} from "../vacancy.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {VacancyRoutingModule} from "./vacancy-routing.module";
import {UiModule} from "../../../../ui-kit/ui.module";
import {CompanyService} from "../../company/services/company.service";
import {VacancyFiltersComponent} from "../vacancy-filters/vacancy-filters.component";
import {SharedModule} from "../../../../shared/shared.module";
import {AboutVacancyComponent} from "../about-vacancy/about-vacancy.component";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [
    VacancyComponent,
    AboutVacancyComponent,
    VacancyFiltersComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    VacancyRoutingModule,
    UiModule,
    ReactiveFormsModule,
    SharedModule,
    TranslateModule
  ],
  exports: [],
  providers: [CompanyService]
})

export class VacancyModule {
}
