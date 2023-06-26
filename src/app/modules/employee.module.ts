import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { EmployeeRoutingModule } from "./employee-routing.module";
import { HomeLayoutComponent } from "./home-layout/home-layout.component";
import { NavigateButtonService } from "./service/navigate-buttons.service";
import { UiModule } from "../ui-kit/ui.module";
import { RobotMapComponent } from "../ui-kit/robot-map/robot-map.component";
import { TranslateModule } from "@ngx-translate/core";
import { IvyCarouselModule } from "angular-responsive-carousel";
import { HeaderModule } from "./header/header.module";
import { HelperService } from "./service/helper.service";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { ImageCropperModule } from "ngx-image-cropper";
import { TooltipModule } from "ng2-tooltip-directive-ng13fix";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [HomeLayoutComponent, RobotMapComponent],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    UiModule,
    TranslateModule,
    IvyCarouselModule,
    HeaderModule,
    SlickCarouselModule,
    ImageCropperModule,
    TooltipModule,
    SharedModule
  ],
  exports: [HomeLayoutComponent],
  providers: [NavigateButtonService, HelperService],
})
export class EmployeeModule {}
