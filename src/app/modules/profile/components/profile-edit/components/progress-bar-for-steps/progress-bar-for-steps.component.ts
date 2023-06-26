import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { BehaviorSubject, Observable, startWith, switchMap, takeUntil } from "rxjs";
import { Unsubscribe } from "src/app/shared-modules/unsubscriber/unsubscribe";
import {
  IEducation,
  IEducationItem,
  IExperiences,
  IProfileInfo,
  IUserSkills,
  IWorkExperience,
} from "../../../utils/profile-form.interface";
import { ProgressBarHelper } from "../../../utils/progress-bar.helper";
import { ProfileFormControlService } from "../../profile-form-control.service";
import { ResumeRoutesEnum } from "../../../utils/resume-routes.constant";

@Component({
  selector: "hr-progress-bar-for-steps",
  templateUrl: "./progress-bar-for-steps.component.html",
  styleUrls: ["./progress-bar-for-steps.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarForStepsComponent extends Unsubscribe implements OnInit, OnDestroy {
  public ResumeRoutesEnum = ResumeRoutesEnum;
  public progressStep1: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public progressStep4: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public section2: boolean | undefined = false;
  public section3: boolean | undefined = false;

  @Input() infoForm!: FormGroup;
  @Input() skillsForm!: FormGroup;
  @Input("edit") edit!: boolean;

  constructor(
    private formControlService: ProfileFormControlService,
    private indexedDb: NgxIndexedDBService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.formControlService.infoChange$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        startWith({}),
        switchMap(() => this.indexedDb.getByIndex("forms", "id", 1) as Observable<IProfileInfo>)
      )
      .subscribe((res) => {
        const infoForm = this.formControlService.infoForm;
        infoForm.patchValue(res, { emitEvent: false });
        this.infoForm = infoForm;
        this.progressStep1.next(ProgressBarHelper.calcPercent(infoForm));
      });

    this.formControlService.savedEducationChange$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        startWith({}),
        switchMap(() => this.indexedDb.getByIndex("forms", "id", 2) as Observable<IEducation>)
      )
      .subscribe((res) => {
        this.section2 = !!res?.savedEducation.length || res?.form.hasNoEducation;
        this.cdr.detectChanges();
      });

    this.formControlService.savedExperienceChange$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        startWith({}),
        switchMap(() => this.indexedDb.getByIndex("forms", "id", 3) as Observable<IExperiences>)
      )
      .subscribe((res) => {
        this.section3 = !!res?.savedExperiences.length || res?.form.hasNoExperience;
        this.cdr.detectChanges();
      });

    this.formControlService.skillsChange$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        startWith({}),
        switchMap(() => this.indexedDb.getByIndex("forms", "id", 4) as Observable<IUserSkills>)
      )
      .subscribe((res) => {
        const skillsForm = this.formControlService.skillsForm;
        skillsForm.patchValue(res, { emitEvent: false });
        this.skillsForm = skillsForm;
        this.progressStep4.next(ProgressBarHelper.calcPercent(skillsForm));
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  public navigateByUrl(url: string): void {
    this.router.navigateByUrl(url);
  }
}
