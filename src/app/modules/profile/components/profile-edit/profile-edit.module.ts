import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";


import {ProfileEditRoutingModule} from "./profile-edit-routing.module";
import {UserInfoComponent} from "./components/user-info/user-info.component";
import {UserExperienceComponent} from "./components/user-experience/user-experience.component";
import {UserEducationComponent} from "./components/user-education/user-education.component";
import {UserSkillsComponent} from "./components/user-skills/user-skills.component";
import {TranslateModule} from "@ngx-translate/core";
import {UiModule} from "src/app/ui-kit/ui.module";
import {ProgressBarForStepsComponent} from "./components/progress-bar-for-steps/progress-bar-for-steps.component";
import {ProfileEditComponent} from "./profile-edit.component";
import {SharedModule} from "../../../../shared/shared.module";

@NgModule({
  declarations: [
    ProfileEditComponent,
    UserInfoComponent,
    UserExperienceComponent,
    UserEducationComponent,
    UserSkillsComponent,
    ProgressBarForStepsComponent,
  ],
  imports: [
    CommonModule,
    ProfileEditRoutingModule,
    TranslateModule,
    UiModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
})
export class ProfileEditModule {}
