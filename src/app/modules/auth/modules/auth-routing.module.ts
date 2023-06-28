import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {AuthComponent} from "../auth.component";

const routes: Routes = [
  {
    path: "",
    // redirectTo: "signIn",
    component: AuthComponent,
  },
  {
    path: "",
    children: [
      {
        path: "signIn",
        loadChildren: () => import("../signin/modules/signin.module").then(m => m.SignInModule)
      },
      {
        path: "signUp",
        loadChildren: () => import("../signup/modules/signup.module").then(m => m.SignUpModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {
}
