import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {switchMap, takeUntil} from "rxjs";

import {
  DELETE_ICON,
  EDIT_ICON,
  EXPERIENCE_ICON, NEXT_ICON,
  ORANGE_PLUS, PREV_ICON,
} from "../../../../../../shared/constants/images.constant";
import {DateFormatEnum} from "src/app/modules/employee-info/enums/date-format.enum";
import {ProfileFormControlService} from "../../profile-form-control.service";
import {Unsubscribe} from "src/app/shared-modules/unsubscriber/unsubscribe";
import {IWorkExperience} from "../../../utils/profile-form.interface";
import {ScreenSizeService} from "src/app/root-modules/app/services/screen-size.service";
import {ScreenSizeType} from "src/app/root-modules/app/interfaces/screen-size.type";
import {slideInOutAnimation} from "../../../utils/profile-form-animation.constant";
import {Router} from "@angular/router";
import {ResumeRoutesEnum} from "../../../utils/resume-routes.constant";
import {NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {DateParserService} from "../../../../../../root-modules/app/services/date-parser.service";

@Component({
  selector: "app-user-experience",
  templateUrl: "./user-experience.component.html",
  styleUrls: ["./user-experience.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slideInOutAnimation],
})
export class UserExperienceComponent extends Unsubscribe implements OnInit, OnDestroy, AfterViewInit {
  public dateFormat = DateFormatEnum;
  public ORANGE_PLUS = ORANGE_PLUS;
  public EXPERIENCE_ICON = EXPERIENCE_ICON;
  public EDIT_ICON = EDIT_ICON;
  public DELETE_ICON = DELETE_ICON;
  public PREV_ICON = PREV_ICON;
  public NEXT_ICON = NEXT_ICON;
  public isActivatedEditMode: boolean = false;
  public addMoreActive: boolean = false;
  public acceptDateValidity: boolean | undefined;
  public quitDateValidity: boolean | undefined;
  public ResumeRoutesEnum = ResumeRoutesEnum;
  private resizeObserver!: ResizeObserver;

  @ViewChild("contentWrapper") contentWrapper!: ElementRef<HTMLDivElement>;

  public get experienceForm(): FormGroup {
    return this.profileFormControlService.experienceForm;
  }

  public get savedExperiences(): IWorkExperience[] {
    return this.profileFormControlService.savedExperiences;
  }

  public get screenSize(): ScreenSizeType {
    return this.screenSizeService.calcScreenSize;
  }

  constructor(
    private profileFormControlService: ProfileFormControlService,
    private screenSizeService: ScreenSizeService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dateParserService: DateParserService
  ) {
    super();
  }

  ngOnInit(): void {
    this.experienceForm.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((form) =>
          this.profileFormControlService.storeExperienceForm({
            id: 3,
            form,
            savedExperiences: this.savedExperiences,
          })
        )
      )
      .subscribe();

    this.getFormControlByName("hasNoExperience").valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        const fields = ["accept_date", "company", "position", "quit_date", "stillWorking"];
        fields.forEach(field => {
          if (data) {
            this.experienceForm.get(field)?.clearValidators();
          } else {
            this.experienceForm.get(field)?.setValidators([Validators.required]);
          }
          this.experienceForm.get(field)?.updateValueAndValidity({emitEvent: true});
        });
      });
  }

  ngAfterViewInit(): void {
    this.initContentSizeObserver();
  }

  public goToUrl(url: string) {
    if (this.savedExperiences.length || this.getFormControlByName("hasNoExperience").value) {
      this.router.navigateByUrl(url);
    }
  }

  public formatToNgbDate(date: string): NgbDateStruct | undefined {
    return !!date ? this.dateParserService.parseDateToNgbDate(date) : undefined;
  }

  public formatToString(date: string): Date {
    return new Date(date);
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    this.resizeObserver.unobserve(this.contentWrapper.nativeElement);
  }

  public edit(id: number): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    this.isActivatedEditMode = true;
    this.addMoreActive = true;
    this.profileFormControlService.getExperienceById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.setStillWorking(this.experienceForm.get("stillWorking")?.value);
        this.cdr.detectChanges();
      });
  }

  public delete(id: number) {
    const form = this.experienceForm.value;
    const deletedItemIndex = this.savedExperiences.findIndex(item => item.id === id);
    if (deletedItemIndex > -1) {
      this.savedExperiences.splice(deletedItemIndex, 1);
      this.profileFormControlService
        .storeExperienceForm({
          id: 3,
          form,
          savedExperiences: this.savedExperiences,
        })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.experienceForm.reset();
          this.addMoreActive = false;
          this.cdr.detectChanges();
        });
    }
  }

  public activateAddMore(): void {
    this.addMoreActive = true;
    this.isActivatedEditMode = false;
  }

  public getFormControlByName(controlName: string): FormControl {
    return this.experienceForm.get(controlName) as FormControl;
  }

  public selectDateByControlName(date: string, controlName: string): void {
    this.getFormControlByName(controlName).setValue(date, {emitEvent: true});
    if (controlName === "quit_date") {
      this.quitDateValidity = this.getFormControlByName(controlName).valid;
      this.getFormControlByName("stillWorking").clearValidators();
      this.getFormControlByName("stillWorking").updateValueAndValidity();
    } else {
      this.acceptDateValidity = this.getFormControlByName(controlName).valid;
    }
  }

  public updateHasNoExperience(state: boolean) {
    this.getFormControlByName("hasNoExperience").updateValueAndValidity({emitEvent: true});
  }

  public setStillWorking(state: boolean): void {
    this.getFormControlByName("stillWorking").setValue(state);
    this.quitDateValidity = undefined;
    if (state) {
      this.getFormControlByName("stillWorking").setValidators([Validators.required]);
      this.getFormControlByName("quit_date").clearValidators();
      this.getFormControlByName("quit_date").reset();
      this.getFormControlByName("quit_date").updateValueAndValidity();
    } else {
      this.getFormControlByName("quit_date").setValidators([Validators.required]);
      this.getFormControlByName("quit_date").updateValueAndValidity();
      this.getFormControlByName("stillWorking").clearValidators();
      this.getFormControlByName("stillWorking").updateValueAndValidity();
    }
  }

  public saveExperience(): void {
    if (this.experienceForm.valid) {
      const lastItemId = this.savedExperiences.length ?
        this.savedExperiences[this.savedExperiences.length - 1].id ?? -1 : -1;
      this.savedExperiences.push({
        ...this.experienceForm.value,
        ...{id: lastItemId + 1}
      });
      this.updateStoredData();
    }
  }

  public saveEditedExperience(): void {
    const form = this.experienceForm.value;
    const editedItemIndex = this.savedExperiences.findIndex(item => item.id === form.id);
    this.savedExperiences.splice(editedItemIndex, 1, form);
    this.updateStoredData();
  }

  private updateStoredData(): void {
    const form = this.experienceForm.value;
    this.profileFormControlService
      .storeExperienceForm({
        id: 3,
        form,
        savedExperiences: this.savedExperiences,
      })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.experienceForm.reset();
        this.isActivatedEditMode = false;
        this.addMoreActive = false;
        this.acceptDateValidity = undefined;
        this.quitDateValidity = undefined;
        this.cdr.detectChanges();
      });
  }

  public cancelAddition(): void {
    this.experienceForm.reset();
    this.experienceForm.updateValueAndValidity();
    this.addMoreActive = false;
    this.isActivatedEditMode = false;
    this.acceptDateValidity = undefined;
    this.quitDateValidity = undefined;
  }

  private initContentSizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const contentRect = entry.contentRect;
        this.screenSizeService.setProfilEditLayoutSize(contentRect.height + 120);
      }
    });
    this.resizeObserver.observe(this.contentWrapper.nativeElement);
  }
}
