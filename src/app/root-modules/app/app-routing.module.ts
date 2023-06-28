import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";

import { UiKitViewComponent } from "../../ui-kit-view/ui-kit-view.component";
import { AppComponent } from "./component/app.component";
import { AuthGuard } from "src/app/shared/guards/auth.guard";

const routes: Routes = [
  {
    path: "",
    component: AppComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "/signIn",
      },
      {
        path: "",
        loadChildren: () => import("../../modules/auth/modules/auth.module").then((m) => m.AuthModule),
      },
      {
        path: "",
        loadChildren: () =>
          import("../../modules/service-pages/modules/service-pages.module").then((module) => module.ServicePagesModule),
      },
      {
        path: "",
        loadChildren: () => import("../../modules/employee.module").then((m) => m.EmployeeModule),
        canActivateChild: [AuthGuard],
      },
      {
        path: "ui-kit",
        component: UiKitViewComponent,
      },
      { path: "**", redirectTo: "/not-found" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: "enabled" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
