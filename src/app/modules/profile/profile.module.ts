import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProfileRoutingModule } from "./profile-routing.module";
import { ProfileViewComponent } from "./components/profile-view/profile-view.component";
import { TranslateModule } from "@ngx-translate/core";
import { UiModule } from "src/app/ui-kit/ui.module";
import { ProfileEditModule } from "./components/profile-edit/profile-edit.module";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [ProfileViewComponent],
  imports: [CommonModule, ProfileRoutingModule, TranslateModule, UiModule, ProfileEditModule, SharedModule],
})
export class ProfileModule {}
