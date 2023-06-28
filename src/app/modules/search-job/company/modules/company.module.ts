import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CompanyRoutingModule } from "./company-routing.module";
import { UiModule } from "../../../../ui-kit/ui.module";
import { AboutCompanyComponent } from "../about-company/about-company.component";
import { SharedModule } from "src/app/shared/shared.module";
import { CompanyComponent } from "../company.component";
import { CompanyService } from "../services/company.service";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [CompanyComponent, AboutCompanyComponent],
  imports: [FormsModule, CommonModule, CompanyRoutingModule, UiModule, SharedModule, SharedModule, TranslateModule],
  exports: [],
  providers: [CompanyService],
})
export class CompanyModule {}
