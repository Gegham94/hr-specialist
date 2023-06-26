import {Injectable} from "@angular/core";
import {Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild} from "@angular/router";
import { AuthService } from "src/app/modules/auth/auth.service";
import { EmployeeInfoFacade } from "src/app/modules/profile/components/utils/employee-info.facade";
import { IEmployee } from "src/app/root-modules/app/interfaces/employee.interface";
import { LocalStorageService } from "src/app/root-modules/app/services/local-storage.service";

@Injectable({providedIn: "root"})
export class AuthGuard implements CanActivateChild {

  private readonly isLogged = !!(this._authService.getToken && this._authService.isTokenExpired);
  public localCompanyData!: Partial<IEmployee>;

  constructor(
    private readonly _router: Router,
    private readonly _authService: AuthService,
    private readonly _localStorage: LocalStorageService,
    private readonly _employeeFacade: EmployeeInfoFacade,
  ) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.isLogged) {
      if (state.url === "/employee/resume/edit/info" || state.url === "/employee/resume") {
        return true;
      } else {
        if (this._localStorage.getItem("resume")) {
          const storedCompany: IEmployee = JSON.parse(
            this._localStorage.getItem("resume")
          );
          this.localCompanyData = {
            robot_helper: storedCompany?.robot_helper,
          };
        }
        const requiredHelper = this.localCompanyData?.robot_helper?.find(
          (helper) => helper.link === state.url + "/isActive"
        );

        if (requiredHelper) {
          if (requiredHelper.hidden) {
            return true;
          }
          void this._router.navigateByUrl("/forbidden");
          return false;
        } else {
          return true;
        }
      }
    }

    this._authService.logOut();
    this._router.navigate(["/signIn"]);
    return false;
  }
}
