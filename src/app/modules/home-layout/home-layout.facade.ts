import { Injectable } from "@angular/core";
import { Observable, delay, map, of, switchMap, take, tap, timer } from "rxjs";
import { IEmployee } from "../../root-modules/app/interfaces/employee.interface";
import { HomeLayoutState } from "./home-layout.state";
import { LocalStorageService } from "../../root-modules/app/services/local-storage.service";
import { RobotHelperService } from "../../root-modules/app/services/robot-helper.service";
import { Router } from "@angular/router";
import { EmployeeInfoFacade } from "../profile/components/utils/employee-info.facade";
import { ResumeRoutesEnum } from "../profile/components/utils/resume-routes.constant";

@Injectable({
  providedIn: "root",
})
export class HomeLayoutFacade {
  public employee$!: Observable<IEmployee>;

  constructor(
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _localStorage: LocalStorageService,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _employeeFacade: EmployeeInfoFacade,
    private readonly _router: Router
  ) {}

  public close(): Observable<null> {
    const robotSettings = this._robotHelperService.robot$.value;
    if (robotSettings?.uuid && this._localStorage.getItem("resume")) {
      this.employee$ = of(JSON.parse(this._localStorage.getItem("resume")));
      return this.employee$.pipe(
        switchMap((data: IEmployee) => {
          const currentPageRobotSettings =
            data.robot_helper?.findIndex((page) => page["uuid"] === robotSettings?.uuid) ?? -1;
          if (
            currentPageRobotSettings >= 0 &&
            data?.robot_helper &&
            !data.robot_helper[currentPageRobotSettings]["hidden"]
          ) {
            data.robot_helper[currentPageRobotSettings]["hidden"] = true;
            this._localStorage.setItem("resume", JSON.stringify(data));
            return this._employeeFacade.updateCurrentPageRobot(data.robot_helper[currentPageRobotSettings].uuid);
          }
          return of(null);
        }),
        switchMap(() => {
          if (
            [ResumeRoutesEnum.EDUCATION, ResumeRoutesEnum.EXPERIENCE, ResumeRoutesEnum.SKILLS].indexOf(
              this._router.url as ResumeRoutesEnum
            ) > -1
          ) {
            // цырк с конями ниже для того, чтобы при закритии помошника на странице заполнения профиля, переадресация на 1ю сработало без анимации
            return timer(0).pipe(
              take(1),
              tap(() => this._robotHelperService.routerAnimation$.next("NO")),
              delay(300),
              tap(() => this._router.navigateByUrl(ResumeRoutesEnum.INFO)),
              delay(300),
              tap(() => this._robotHelperService.routerAnimation$.next("YES")),
              map(() => {
                this._robotHelperService.isRobotOpen$.next(false);
                if (robotSettings && robotSettings.hasOwnProperty("showSecondRobot") && robotSettings.showSecondRobot) {
                  this._robotHelperService.setRobotSettings(robotSettings.showSecondRobot);
                  this._robotHelperService.isRobotOpen$.next(true);
                }
                return null})
            );
          }
          this._robotHelperService.isRobotOpen$.next(false);
          if (robotSettings && robotSettings.hasOwnProperty("showSecondRobot") && robotSettings.showSecondRobot) {
            this._robotHelperService.setRobotSettings(robotSettings.showSecondRobot);
            this._robotHelperService.isRobotOpen$.next(true);
          }

          return of(null);
        })
      );
    }

    this._robotHelperService.isRobotOpen$.next(false);
    if (robotSettings && robotSettings.hasOwnProperty("showSecondRobot") && robotSettings.showSecondRobot) {
      this._robotHelperService.setRobotSettings(robotSettings.showSecondRobot);
      this._robotHelperService.isRobotOpen$.next(true);
    }
    return of(null);
  }
}
