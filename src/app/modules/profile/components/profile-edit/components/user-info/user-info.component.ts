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

import { SearchableSelectDataInterface } from "src/app/root-modules/app/interfaces/searchable-select-data.interface";
import {
  specialistPosition,
  citizenShips,
  employments,
  genders,
  price,
} from "src/app/modules/employee-info/mock/specialist-mock";
import { ProfileFormControlService } from "../../profile-form-control.service";
import { Unsubscribe } from "src/app/shared-modules/unsubscriber/unsubscribe";
import { EmployeeInfoFacade } from "../../../utils/employee-info.facade";
import { NEXT_ICON, PREV_ICON } from "../../../../../../shared/constants/images.constant";
import { Router } from "@angular/router";
import { ResumeRoutesEnum } from "../../../utils/resume-routes.constant";
import { IEmployee } from "../../../../../../root-modules/app/interfaces/employee.interface";
import { RobotHelperService } from "../../../../../../root-modules/app/services/robot-helper.service";
import { LocalStorageService } from "../../../../../../root-modules/app/services/local-storage.service";
import { RobotHelper } from "../../../../../../root-modules/app/interfaces/robot-helper.interface";
import { InputStatusEnum } from "../../../../../../root-modules/app/constants/input-status.enum";
import { ScreenSizeService } from "src/app/root-modules/app/services/screen-size.service";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-user-info",
  templateUrl: "./user-info.component.html",
  styleUrls: ["./user-info.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoComponent extends Unsubscribe implements OnInit, OnDestroy, AfterViewInit {
  // field options
  public searchListCountry$: Observable<SearchableSelectDataInterface[] | null> = this.employeeFacade
    .getVacancyLocationCountriesRequest$()
    .pipe(tap(() => this.countryLoader$.next(false)));
  public searchListCity$: Observable<SearchableSelectDataInterface[] | null> = this.employeeFacade
    .getVacancyLocationCitiesRequest$()
    .pipe(tap(() => this.cityLoader$.next(false)));
  public price: SearchableSelectDataInterface[] = price;
  public genders: SearchableSelectDataInterface[] = genders;
  public employments: SearchableSelectDataInterface[] = employments;
  public citizenShips: SearchableSelectDataInterface[] = citizenShips;
  public specialistPosition: SearchableSelectDataInterface[] = specialistPosition;

  // loaders
  public countryLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public cityLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  public datepickerValidity!: boolean;

  public PREV_ICON = PREV_ICON;
  public NEXT_ICON = NEXT_ICON;
  public ResumeRoutesEnum = ResumeRoutesEnum;

  public isRobotOpen$: Observable<boolean> = this.robotHelperService.isRobotOpen;
  public robotSettings$: Observable<RobotHelper> = this.robotHelperService.getRobotSettings();
  public salary = price;
  private resizeObserver!: ResizeObserver;
  private selectedCountryId: string = "";

  @ViewChild("contentWrapper") contentWrapper!: ElementRef<HTMLDivElement>;

  get infoForm(): FormGroup {
    return this.profileFormControlService.infoForm;
  }

  public employeeInfo!: Observable<IEmployee | null>;
  public isLogo: BehaviorSubject<boolean | undefined> = new BehaviorSubject<boolean | undefined>(undefined);
  public inputStatusList = InputStatusEnum;

  public readonly formFieldsNumber = Object.keys(this.infoForm.controls).length;

  constructor(
    private profileFormControlService: ProfileFormControlService,
    private employeeFacade: EmployeeInfoFacade,
    private robotHelperService: RobotHelperService,
    private localStorage: LocalStorageService,
    private screenSizeService: ScreenSizeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.isRobot();
    this.countryChange();
    this.employeeFacade.setLocationCountriesRequest$().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    this.infoForm.valueChanges
      .pipe(
        // debounceTime prevents city field being reset
        debounceTime(500),
        takeUntil(this.ngUnsubscribe),
        switchMap((form) => {
          // if statement is reqired to skip valueChanges with no data, to avoid reseting the form
          if (this.infoForm.value.phone) {
            return this.profileFormControlService.storeInfoForm(form);
          }
          return of(null);
        })
      )
      .subscribe();
    this.getFormControlByName("image")
      .valueChanges.pipe(
        takeUntil(this.ngUnsubscribe),
        tap((data) => {
          this.isLogo.next(true);
        })
      )
      .subscribe();

    this.infoForm.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(() => {
          if (this.getValidFieldLength() === (this.formFieldsNumber - 1)
            && this.infoForm.get("image")?.invalid) {
            this.isLogo.next(false);
          }
        })
      ).subscribe();
  }

  public getValidFieldLength() {
    const validFormData: boolean[] = [];
    Object.keys(this.infoForm.controls).forEach(key => {
      const control = this.infoForm.get(key);
      if (control && control.valid) {
        validFormData.push(true);
      }
    });
    return validFormData.length;
  }

  ngAfterViewInit(): void {
    this.initContentSizeObserver();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    this.resizeObserver.unobserve(this.contentWrapper.nativeElement);
  }

  private isRobot() {
    this.localStorage.resume$
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

          this.robotHelperService.setRobotSettings({
            content: ["step1", "step2", "step3", "step4"],
            navigationItemId: null,
            isContentActive: true,
            uuid: employeeInfo?.uuid,
          });

          if (resume?.robot_helper && employeeInfo && !employeeInfo?.hidden && employeeIsActiveIndex >= 0) {
            this.robotHelperService.setRobotSettings({
              content: ["step1", "step2", "step3", "step4"],
              navigationItemId: null,
              isContentActive: true,
              uuid: employeeInfo.uuid,
            });

            this.robotHelperService.isRobotOpen$.next(true);
          }
        }
      });
  }

  public goToUrl(url: string) {
    if (!this.getFormControlByName("image").value) {
      this.isLogo.next(false);
      return;
    }
    this.router.navigateByUrl(url);
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
        switchMap((selectedCountry: SearchableSelectDataInterface[] | string) => {
          if (typeof this.infoForm.get("city")?.value !== "string" && this.infoForm.get("country")?.touched) {
            this.infoForm.get("city")?.setValue("");
          }
          if (typeof selectedCountry !== "string" && selectedCountry && selectedCountry.length) {
            if (this.selectedCountryId === selectedCountry[0].id && this.infoForm.get("city")?.value) {
              return of(null);
            }
            const uuId = selectedCountry[0].id as string;
            this.selectedCountryId = selectedCountry[0].id as string;
            return this.employeeFacade.setLocationCitiesRequest$({ countryId: uuId });
          }
          return of(null);
        })
      )
      .subscribe(() => {
        this.cdr.detectChanges();
      });
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
