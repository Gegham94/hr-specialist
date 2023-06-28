import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { FormGroup } from "@angular/forms";
import { takeUntil } from "rxjs";
import {
  moveBackWithNoAnimation,
  moveFromLeftAnimation,
  moveFromRightAnimation,
} from "../../constants/profile-form-animation.constant";
import { ScreenSizeService } from "src/app/shared/services/screen-size.service";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { ResumeRoutesEnum } from "../../constants/resume-routes.constant";
import { EmployeeInfoFacade } from "../../services/employee-info.facade";
import { RobotHelperService } from "src/app/shared/services/robot-helper.service";
import { ProfileEditFacade } from "./service/profile-edit.facade";

@Component({
  selector: "app-profile-edit",
  templateUrl: "./profile-edit.component.html",
  styleUrls: ["./profile-edit.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [moveFromLeftAnimation, moveFromRightAnimation, moveBackWithNoAnimation],
})
export class ProfileEditComponent extends Unsubscribe implements OnInit, OnDestroy {
  public get infoForm(): FormGroup {
    return this._profileEditFacade.getInfoForm();
  }
  public get skillsForm(): FormGroup {
    return this._profileEditFacade.getSkillsForm();
  }

  private _layoutHeight: number = this._screenSizeService.layoutHeight;
  public get layoutHeight(): number {
    return this._layoutHeight;
  }

  private set layoutHeight(value: number) {
    this._layoutHeight = value;
  }

  constructor(
    public _robotHelperService: RobotHelperService,
    private _profileEditFacade: ProfileEditFacade,
    private _screenSizeService: ScreenSizeService,
    private _employeeFacade: EmployeeInfoFacade,
    private _cdr: ChangeDetectorRef,
    private _router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this._screenSizeService.profilEditLayoutSize$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((height) => {
      this.layoutHeight = height;
      this._cdr.markForCheck();
    });

    this._employeeFacade
      .getSelectedContentReference()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        switch (data) {
          case "step1": {
            this._router.navigateByUrl(ResumeRoutesEnum.INFO);
            break;
          }
          case "step2": {
            this._router.navigateByUrl(ResumeRoutesEnum.EDUCATION);
            break;
          }
          case "step3": {
            this._router.navigateByUrl(ResumeRoutesEnum.EXPERIENCE);
            break;
          }
          case "step4": {
            this._router.navigateByUrl(ResumeRoutesEnum.SKILLS);
            break;
          }
          default: {
          }
        }
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  public getState(outlet: RouterOutlet) {
    return outlet.activatedRouteData["state"];
  }
}
