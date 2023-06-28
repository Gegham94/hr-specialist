import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Component } from "@angular/core";
import {
  DELETE_ICON,
  EDIT_ICON,
  EDUCATION_ICON,
  NEXT_ICON,
  ORANGE_PLUS,
  PREV_ICON,
} from "../../../../../../shared/constants/images.constant";
import { ScreenSizeService } from "src/app/shared/services/screen-size.service";
import { IEducationItem } from "../../../../interfaces/profile-form.interface";
import { BehaviorSubject, Observable, switchMap, takeUntil } from "rxjs";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { educations, faculties } from "src/app/modules/profile/mock/specialist-mock";
import { EmployeeInfoFacade } from "../../../../services/employee-info.facade";
import { slideInOutAnimation } from "../../../../constants/profile-form-animation.constant";
import { Router } from "@angular/router";
import { ResumeRoutesEnum } from "../../../../constants/resume-routes.constant";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { DateParserService } from "../../../../../../shared/services/date-parser.service";
import { ProfileEditFacade } from "../../service/profile-edit.facade";
import { ISearchableSelectData } from "src/app/shared/interfaces/searchable-select-data.interface";
import { ScreenSizeType } from "src/app/shared/interfaces/screen-size.type";

@Component({
  selector: "app-user-education",
  templateUrl: "./user-education.component.html",
  styleUrls: ["./user-education.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slideInOutAnimation],
})
export class UserEducationComponent extends Unsubscribe implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("contentWrapper") contentWrapper!: ElementRef<HTMLDivElement>;

  public EDUCATION_ICON = EDUCATION_ICON;
  public ORANGE_PLUS = ORANGE_PLUS;
  public EDIT_ICON = EDIT_ICON;
  public DELETE_ICON = DELETE_ICON;
  public isActivatedEditMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public addMoreActive: boolean = false;
  public faculties: ISearchableSelectData[] = faculties;
  public educationFormats: ISearchableSelectData[] = educations;
  public universities$: Observable<ISearchableSelectData[]> = this._employeeFacade.getUniversityRequest$();

  public dateValidity: boolean | undefined;
  public ResumeRoutesEnum = ResumeRoutesEnum;
  public PREV_ICON = PREV_ICON;
  public NEXT_ICON = NEXT_ICON;

  private resizeObserver!: ResizeObserver;

  public get educationForm(): FormGroup {
    return this._profileEditFacade.getEducationForm();
  }

  public get savedEducation(): IEducationItem[] {
    return this._profileEditFacade.getSavedEducation();
  }

  public updateHasNoEducation() {
    this.getFormControlByName("hasNoEducation").updateValueAndValidity({ emitEvent: true });
  }

  public get screenSize(): ScreenSizeType {
    return this._screenSizeService.calcScreenSize;
  }

  constructor(
    private _profileEditFacade: ProfileEditFacade,
    private _screenSizeService: ScreenSizeService,
    private _employeeFacade: EmployeeInfoFacade,
    private _router: Router,
    private _cdr: ChangeDetectorRef,
    private _dateParserService: DateParserService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.educationForm.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((form) => {
          return this._profileEditFacade.storeEducationForm({
            id: 2,
            form,
            savedEducation: this.savedEducation,
          });
        })
      )
      .subscribe();

    this._employeeFacade.setUniversitiesRequest$().pipe(takeUntil(this.ngUnsubscribe)).subscribe();

    this.getFormControlByName("hasNoEducation")
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        const fields = ["education_id", "faculty", "graduate_date", "trainingFormat"];
        fields.forEach((field) => {
          if (data) {
            this.educationForm.get(field)?.clearValidators();
          } else {
            this.educationForm.get(field)?.setValidators([Validators.required]);
          }
          this.educationForm.get(field)?.updateValueAndValidity({ emitEvent: true });
        });
      });
  }

  public ngAfterViewInit(): void {
    this.initContentSizeObserver();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
    this.resizeObserver.unobserve(this.contentWrapper.nativeElement);
  }

  public goToUrl(url: string): void {
    if (this.savedEducation.length || this.getFormControlByName("hasNoEducation").value) {
      this._router.navigateByUrl(url);
    }
  }

  public formatToNgbDate(date: string): NgbDateStruct | undefined {
    return !!date ? this._dateParserService.parseDateToNgbDate(date) : undefined;
  }

  public formatToString(date: string): Date {
    return new Date(date);
  }

  public activateAddMore(): void {
    this.addMoreActive = true;
    this.isActivatedEditMode.next(false);
  }

  public getFormControlByName(controlName: string): FormControl {
    return this.educationForm.get(controlName) as FormControl;
  }

  public selectDateByControlName(date: string, controlName: string): void {
    this.getFormControlByName(controlName).setValue(date, { emitEvent: true });
    this.dateValidity = this.getFormControlByName(controlName).valid;
  }

  public saveEducation(): void {
    if (this.educationForm.valid) {
      const lastItemId =
        this.savedEducation.length > 0 ? this.savedEducation[this.savedEducation.length - 1].id ?? -1 : -1;
      this.savedEducation.push({ ...this.educationForm.value, ...{ id: lastItemId + 1 } });
      this.updateStoredData();
    }
  }

  public saveEditedEducation(): void {
    const form = this.educationForm.value;
    const editedItemIndex = this.savedEducation.findIndex((item) => item.id === form.id);
    this.savedEducation.splice(editedItemIndex, 1, form);
    this.updateStoredData();
  }

  private updateStoredData(): void {
    const form = this.educationForm.value;
    this._profileEditFacade
      .storeEducationForm({
        id: 2,
        form,
        savedEducation: this.savedEducation,
      })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.educationForm.reset();
        this.dateValidity = undefined;
        this.addMoreActive = false;
        this._cdr.markForCheck();
      });
  }

  public edit(id: number): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    this.isActivatedEditMode.next(true);
    this.addMoreActive = true;
    this._profileEditFacade
      .getEducationById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this._cdr.markForCheck());
  }

  public delete(id: number) {
    const form = this.educationForm.value;
    const deletedItemIndex = this.savedEducation.findIndex((item) => item.id === id);
    if (deletedItemIndex > -1) {
      this.savedEducation.splice(deletedItemIndex, 1);
      this._profileEditFacade
        .storeEducationForm({
          id: 2,
          form,
          savedEducation: this.savedEducation,
        })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.educationForm.reset();
          this.addMoreActive = false;
          this._cdr.markForCheck();
        });
    }
  }

  public cancelAddition(): void {
    this.educationForm.reset();
    this.addMoreActive = false;
    this.isActivatedEditMode.next(false);
    this.dateValidity = undefined;
  }

  private initContentSizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const contentRect = entry.contentRect;
        this._screenSizeService.setProfilEditLayoutSize(contentRect.height + 120);
      }
    });
    this.resizeObserver.observe(this.contentWrapper.nativeElement);
  }
}
