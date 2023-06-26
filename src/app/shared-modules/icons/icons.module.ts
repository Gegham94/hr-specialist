import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AddVacancyIconComponent } from "./add-vacancy-icon/add-vacancy-icon.component";
import { AnalyticIconComponent } from "./analytic-icon/analytic-icon.component";
import { MyVacancyIconComponent } from "./my-vacancy-icon/my-vacancy-icon.component";
import { SpecialistIconComponent } from "./specialist-icon/specialist-icon.component";
import { BalanceIconComponent } from "./balance-icon/balance-icon.component";
import { FindVacancyIconComponent } from "./find-vacancy-icon/find-vacancy-icon.component";



@NgModule({
    declarations: [
        AddVacancyIconComponent,
        AnalyticIconComponent,
        MyVacancyIconComponent,
        SpecialistIconComponent,
        BalanceIconComponent,
        FindVacancyIconComponent
    ],
  imports: [
    CommonModule
  ],
    exports: [
        AddVacancyIconComponent,
        AnalyticIconComponent,
        MyVacancyIconComponent,
        SpecialistIconComponent,
        BalanceIconComponent,
        FindVacancyIconComponent
    ]
})
export class IconsModule { }
