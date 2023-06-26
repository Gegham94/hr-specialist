import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UiKitViewComponent } from "./ui-kit-view.component";
import { UiModule } from "../ui-kit/ui.module";
import { OldSharedModule } from "../shared-modules/shared.module";



@NgModule({
  declarations: [
    UiKitViewComponent
  ],
  imports: [
    CommonModule,
    UiModule,
    OldSharedModule
  ]
})
export class UiKitViewModule { }
