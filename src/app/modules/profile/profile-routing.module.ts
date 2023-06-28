import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProfileViewComponent } from "./components/profile-view/profile-view.component";

const routes: Routes = [
  {
    path: "",
    component: ProfileViewComponent,
  },
  {
    path: "edit",
    loadChildren: () => import("./components/profile-edit/modules/profile-edit.module").then(m => m.ProfileEditModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
