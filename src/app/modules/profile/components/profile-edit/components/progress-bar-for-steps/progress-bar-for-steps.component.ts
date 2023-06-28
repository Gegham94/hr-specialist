import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { BehaviorSubject, Observable, startWith, switchMap, takeUntil } from "rxjs";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { IEducation, IExperiences, IProfileInfo, IUserSkills } from "../../../../interfaces/profile-form.interface";
import { ProgressBarHelper } from "../../../../utils/progress-bar.helper";
import { ResumeRoutesEnum } from "../../../../constants/resume-routes.constant";
import { ProfileEditFacade } from "../../service/profile-edit.facade";

@Component({
  selector: "hr-progress-bar-for-steps",
  templateUrl: "./progress-bar-for-steps.component.html",
  styleUrls: ["./progress-bar-for-steps.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarForStepsComponent extends Unsubscribe implements OnInit, OnDestroy {
  @Input() infoForm!: FormGroup;
  @Input() skillsForm!: FormGroup;
  @Input("edit") edit!: boolean;

  public ResumeRoutesEnum = ResumeRoutesEnum;
  public progressStep1: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public progressStep4: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public section2: boolean | undefined = false;
  public section3: boolean | undefined = false;

  constructor(
    private _profileEditFacade: ProfileEditFacade,
    private _indexedDb: NgxIndexedDBService,
    private _cdr: ChangeDetectorRef,
    private _router: Router
  ) {
    super();
  }

  public ngOnInit() {
    this._profileEditFacade.getInfoChange$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        startWith({}),
        switchMap(() => this._indexedDb.getByIndex("forms", "id", 1) as Observable<IProfileInfo>)
      )
      .subscribe((res) => {
        const infoForm = this._profileEditFacade.getInfoForm();
        infoForm.patchValue(res, { emitEvent: false });
        this.infoForm = infoForm;
        this.progressStep1.next(ProgressBarHelper.calcPercent(infoForm));
      });

    this._profileEditFacade.getSavedEducationChange$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        startWith({}),
        switchMap(() => this._indexedDb.getByIndex("forms", "id", 2) as Observable<IEducation>)
      )
      .subscribe((res) => {
        this.section2 = !!res?.savedEducation.length || res?.form.hasNoEducation;
        this._cdr.markForCheck();
      });

    this._profileEditFacade.getSavedExperienceChange$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        startWith({}),
        switchMap(() => this._indexedDb.getByIndex("forms", "id", 3) as Observable<IExperiences>)
      )
      .subscribe((res) => {
        this.section3 = !!res?.savedExperiences.length || res?.form.hasNoExperience;
        this._cdr.markForCheck();
      });

    this._profileEditFacade.getSkillsChange$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        startWith({}),
        switchMap(() => this._indexedDb.getByIndex("forms", "id", 4) as Observable<IUserSkills>)
      )
      .subscribe((res) => {
        const skillsForm = this._profileEditFacade.getSkillsForm();
        skillsForm.patchValue(res, { emitEvent: false });
        this.skillsForm = skillsForm;
        this.progressStep4.next(ProgressBarHelper.calcPercent(skillsForm));
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  public navigateByUrl(url: string): void {
    this._router.navigateByUrl(url);
  }
}
