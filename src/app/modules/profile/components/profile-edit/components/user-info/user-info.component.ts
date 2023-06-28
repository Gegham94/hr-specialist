import {
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Component } from "@angular/core";
import { BehaviorSubject, debounceTime, filter, Observable, of, switchMap, takeUntil, tap } from "rxjs";
import {
  specialistPosition,
  citizenShips,
  employments,
  genders,
  price,
} from "src/app/modules/profile/mock/specialist-mock";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { EmployeeInfoFacade } from "../../../../services/employee-info.facade";
import { NEXT_ICON } from "../../../../../../shared/constants/images.constant";
import { Router } from "@angular/router";
import { ResumeRoutesEnum } from "../../../../constants/resume-routes.constant";
import { RobotHelperService } from "../../../../../../shared/services/robot-helper.service";
import { LocalStorageService } from "../../../../../../shared/services/local-storage.service";
import { ScreenSizeService } from "src/app/shared/services/screen-size.service";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { ProfileEditFacade } from "../../service/profile-edit.facade";
import { ISearchableSelectData } from "src/app/shared/interfaces/searchable-select-data.interface";
import { RobotHelper } from "src/app/shared/interfaces/robot-helper.interface";
import { InputStatusEnum } from "src/app/shared/constants/input-status.enum";

@Component({
  selector: "app-user-info",
  templateUrl: "./user-info.component.html",
  styleUrls: ["./user-info.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoComponent extends Unsubscribe implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("contentWrapper") contentWrapper!: ElementRef<HTMLDivElement>;

  // field options
  public searchListCountry$: Observable<ISearchableSelectData[] | null> = this._employeeFacade
    .getVacancyLocationCountriesRequest$()
    .pipe(tap(() => this.countryLoader$.next(false)));
  public searchListCity$: Observable<ISearchableSelectData[] | null> = this._employeeFacade
    .getVacancyLocationCitiesRequest$()
    .pipe(tap(() => this.cityLoader$.next(false)));
  public price: ISearchableSelectData[] = price;
  public genders: ISearchableSelectData[] = genders;
  public employments: ISearchableSelectData[] = employments;
  public citizenShips: ISearchableSelectData[] = citizenShips;
  public specialistPosition: ISearchableSelectData[] = specialistPosition;

  // loaders
  public countryLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public cityLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public datepickerValidity!: boolean;
  public NEXT_ICON = NEXT_ICON;
  public ResumeRoutesEnum = ResumeRoutesEnum;
  public isRobotOpen$: Observable<boolean> = this._robotHelperService.isRobotOpen;
  public robotSettings$: Observable<RobotHelper> = this._robotHelperService.getRobotSettings();
  public salary = price;
  public isLogo: BehaviorSubject<boolean | undefined> = new BehaviorSubject<boolean | undefined>(undefined);
  public inputStatusList = InputStatusEnum;

  private resizeObserver!: ResizeObserver;
  private selectedCountryId: string = "";
  private readonly formFieldsNumber = Object.keys(this.infoForm.controls).length;

  public get infoForm(): FormGroup {
    return this._profileEditFacade.getInfoForm();
  }

  constructor(
    private _profileEditFacade: ProfileEditFacade,
    private _employeeFacade: EmployeeInfoFacade,
    private _robotHelperService: RobotHelperService,
    private _localStorage: LocalStorageService,
    private _screenSizeService: ScreenSizeService,
    private _router: Router,
    private _cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.isRobot();
    this.countryChange();
    this._employeeFacade.setLocationCountriesRequest$().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    this.infoForm.valueChanges
      .pipe(
        // debounceTime prevents city field being reset
        debounceTime(500),
        takeUntil(this.ngUnsubscribe),
        switchMap((form) => {
          // if statement is reqired to skip valueChanges with no data, to avoid reseting the form
          if (this.infoForm.value.phone) {
            return this._profileEditFacade.storeInfoForm(form);
          }
          return of(null);
        })
      )
      .subscribe();
    this.getFormControlByName("image")
      .valueChanges.pipe(
        takeUntil(this.ngUnsubscribe),
        tap(() => {
          this.isLogo.next(true);
        })
      )
      .subscribe();

    this.infoForm.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(() => {
          if (this.getValidFieldLength() === this.formFieldsNumber - 1 && this.infoForm.get("image")?.invalid) {
            this.isLogo.next(false);
          }
        })
      )
      .subscribe();
  }

  public ngAfterViewInit(): void {
    this.initContentSizeObserver();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
    this.resizeObserver.unobserve(this.contentWrapper.nativeElement);
  }

  public getValidFieldLength() {
    const validFormData: boolean[] = [];
    Object.keys(this.infoForm.controls).forEach((key) => {
      const control = this.infoForm.get(key);
      if (control && control.valid) {
        validFormData.push(true);
      }
    });
    return validFormData.length;
  }

  private isRobot() {
    this._localStorage.resume$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((data) => !!data)
      )
      .subscribe((resume) => {
        if (resume) {
          const employeeInfo = resume.robot_helper?.find(
            (item: { link: string }) => item.link === "/employee/employee-info-2"
          );

          const employeeIsActiveIndex =
            resume.robot_helper?.findIndex(
              (item: { link: string }) => item.link === "/employee/employee-info/isActive"
            ) ?? -1;

          this._robotHelperService.setRobotSettings({
            content: ["step1", "step2", "step3", "step4"],
            navigationItemId: null,
            isContentActive: true,
            uuid: employeeInfo?.uuid,
          });

          if (resume?.robot_helper && employeeInfo && !employeeInfo?.hidden && employeeIsActiveIndex >= 0) {
            this._robotHelperService.setRobotSettings({
              content: ["step1", "step2", "step3", "step4"],
              navigationItemId: null,
              isContentActive: true,
              uuid: employeeInfo.uuid,
            });

            this._robotHelperService.isRobotOpen$.next(true);
          }
        }
      });
  }

  public goToUrl(url: string) {
    if (!this.getFormControlByName("image").value) {
      this.isLogo.next(false);
      return;
    }
    this._router.navigateByUrl(url);
  }

  public getFormControlByName(controlName: string): FormControl {
    return this.infoForm.get(controlName) as FormControl;
  }

  public get endDate(): NgbDateStruct {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentDay = new Date().getDate();
    return { year: currentYear, month: currentMonth, day: currentDay };
  }

  public selectBirthday(date: string): void {
    this.getFormControlByName("dateOfBirth").setValue(date, { emitEvent: true });
    this.datepickerValidity = this.getFormControlByName("dateOfBirth").valid;
    this.getFormControlByName("dateOfBirth").updateValueAndValidity();
  }

  private countryChange(): void {
    this.infoForm
      .get("country")
      ?.valueChanges.pipe(
        debounceTime(300),
        takeUntil(this.ngUnsubscribe),
        switchMap((selectedCountry: ISearchableSelectData[] | string) => {
          if (typeof this.infoForm.get("city")?.value !== "string" && this.infoForm.get("country")?.touched) {
            this.infoForm.get("city")?.setValue("");
          }
          if (typeof selectedCountry !== "string" && selectedCountry && selectedCountry.length) {
            if (this.selectedCountryId === selectedCountry[0].id && this.infoForm.get("city")?.value) {
              return of(null);
            }
            const uuId = selectedCountry[0].id as string;
            this.selectedCountryId = selectedCountry[0].id as string;
            return this._employeeFacade.setLocationCitiesRequest$({ countryId: uuId });
          }
          return of(null);
        })
      )
      .subscribe(() => {
        this._cdr.markForCheck();
      });
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
