import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { UserExperienceComponent } from "../components/user-experience/user-experience.component";
import { UserEducationComponent } from "../components/user-education/user-education.component";
import { UserSkillsComponent } from "../components/user-skills/user-skills.component";
import { UserInfoComponent } from "../components/user-info/user-info.component";
import { ProfileEditComponent } from "../profile-edit.component";
import {EditProfileGuard} from "../../../../../shared/guards/edit-profile.guard";

const routes: Routes = [
  {
    path: "",
    component: ProfileEditComponent,
    canActivateChild: [EditProfileGuard],
    children: [
      {
        path: "info",
        component: UserInfoComponent,
        data: { state: "info" },
      },
      {
        path: "education",
        component: UserEducationComponent,
        data: { state: "education" },
      },
      {
        path: "experience",
        component: UserExperienceComponent,
        data: { state: "experience" },
      },
      {
        path: "skills",
        component: UserSkillsComponent,
        data: { state: "skills" },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileEditRoutingModule {}
