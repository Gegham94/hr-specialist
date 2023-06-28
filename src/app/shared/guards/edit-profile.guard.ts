import {Injectable} from "@angular/core";
import {Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild} from "@angular/router";
import {AuthService} from "../../modules/auth/service/auth.service";
import {EmployeeInfoFacade} from "../../modules/profile/services/employee-info.facade";
import {LocalStorageService} from "../services/local-storage.service";
import {ResumeRoutesEnum} from "../../modules/profile/constants/resume-routes.constant";
import {ProfileFormControlService} from "../../modules/profile/components/profile-edit/service/profile-form-control.service";
import {BehaviorSubject, takeUntil} from "rxjs";
import {RobotHelperService} from "../services/robot-helper.service";
import {Unsubscribe} from "../unsubscriber/unsubscribe";

@Injectable({providedIn: "root"})
export class EditProfileGuard extends Unsubscribe implements CanActivateChild {

  public ResumeRoutesEnum = ResumeRoutesEnum;
  public isRobotOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly _router: Router,
    private readonly _profileFormControlService: ProfileFormControlService,
    private readonly _robotHelperService: RobotHelperService,
  ) {
    super();
    this._robotHelperService.isRobotOpen
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.isRobotOpen.next(data);
      });
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.isRobotOpen.value) {
      switch (state.url) {
        case ResumeRoutesEnum.INFO: {
          return true;
        }
        case ResumeRoutesEnum.EDUCATION: {
          if (this._profileFormControlService.infoForm.valid) {
            return true;
          }
          this._router.navigateByUrl(ResumeRoutesEnum.INFO);
          return false;
        }
        case ResumeRoutesEnum.EXPERIENCE: {
          if (this._profileFormControlService.infoForm.valid
            && (!!this._profileFormControlService.educationForm.get("hasNoEducation")?.value
              || !!this._profileFormControlService.savedEducation.length)) {
            return true;
          }
          this._router.navigateByUrl(ResumeRoutesEnum.INFO);
          return false;
        }
        case ResumeRoutesEnum.SKILLS: {
          if (this._profileFormControlService.infoForm.valid
            && (!!this._profileFormControlService.educationForm.get("hasNoEducation")?.value
              || !!this._profileFormControlService.savedEducation.length)
            && (this._profileFormControlService.experienceForm.get("hasNoExperience")?.value
              || !!this._profileFormControlService.savedExperiences.length)) {
            return true;
          }
          this._router.navigateByUrl(ResumeRoutesEnum.INFO);
          return false;
        }
        default: return true;
      }
    } else {
      return true;
    }

  }
}
