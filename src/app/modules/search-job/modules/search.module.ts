import { NgModule } from "@angular/core";
import { SearchComponent } from "../search.component";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { UiModule } from "../../../ui-kit/ui.module";
import { CompanyService } from "../company/services/company.service";
import { SearchRoutingModule } from "./search-routing.module";

@NgModule({
  declarations: [SearchComponent],
  imports: [FormsModule, CommonModule, SearchRoutingModule, UiModule, SharedModule, SharedModule],
  exports: [],
  providers: [CompanyService],
})
export class SearchModule {}
