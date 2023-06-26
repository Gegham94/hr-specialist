import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {Router, RouterOutlet} from "@angular/router";
import {FormGroup} from "@angular/forms";
import { Subject, takeUntil} from "rxjs";
import {moveBackWithNoAnimation, moveFromLeftAnimation, moveFromRightAnimation} from "../utils/profile-form-animation.constant";
import {ScreenSizeService} from "src/app/root-modules/app/services/screen-size.service";
import {Unsubscribe} from "src/app/shared-modules/unsubscriber/unsubscribe";
import {ProfileFormControlService} from "./profile-form-control.service";
import {ResumeRoutesEnum} from "../utils/resume-routes.constant";
import {EmployeeInfoFacade} from "../utils/employee-info.facade";
import { RobotHelperService } from "src/app/root-modules/app/services/robot-helper.service";

@Component({
  selector: "app-profile-edit",
  templateUrl: "./profile-edit.component.html",
  styleUrls: ["./profile-edit.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [moveFromLeftAnimation, moveFromRightAnimation, moveBackWithNoAnimation],
})
export class ProfileEditComponent extends Unsubscribe implements OnInit, OnDestroy {
  public updateProgressBar: Subject<boolean | null> = new Subject<boolean | null>();
  public ResumeRoutesEnum = ResumeRoutesEnum;
  private _layoutHeight: number = this.screenSizeService.layoutHeight;

  public get layoutHeight(): number {
    return this._layoutHeight;
  }

  private set layoutHeight(value: number) {
    this._layoutHeight = value;
  }

  constructor(
    public robotHelperService: RobotHelperService,
    private formControlService: ProfileFormControlService,
    private screenSizeService: ScreenSizeService,
    private employeeFacade: EmployeeInfoFacade,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    super();
  }

  get infoForm(): FormGroup {
    return this.formControlService.infoForm;
  }

  get skillsForm(): FormGroup {
    return this.formControlService.skillsForm;
  }

  ngOnInit(): void {
    this.screenSizeService.profilEditLayoutSize$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((height) => {
      this.layoutHeight = height;
      this.cdr.detectChanges();
    });

    this.employeeFacade.getSelectedContentReference()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        switch (data) {
          case "step1": {
            this.router.navigateByUrl(ResumeRoutesEnum.INFO);
            break;
          }
          case "step2": {
            this.router.navigateByUrl(ResumeRoutesEnum.EDUCATION);
            break;
          }
          case "step3": {
            this.router.navigateByUrl(ResumeRoutesEnum.EXPERIENCE);
            break;
          }
          case "step4": {
            this.router.navigateByUrl(ResumeRoutesEnum.SKILLS);
            break;
          }
          default: {
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  public getState(outlet: RouterOutlet) {
    return outlet.activatedRouteData["state"];
  }
}
