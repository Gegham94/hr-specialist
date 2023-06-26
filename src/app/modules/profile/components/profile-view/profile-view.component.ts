import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from "@angular/core";
import {OnDestroy, OnInit} from "@angular/core";
import {IEmployee} from "../../../../root-modules/app/interfaces/employee.interface";
// import {DateFormatEnum} from "../../enums/date-format.enum";
import {TagTypesEnum} from "../../../../root-modules/app/constants/tag-types.enum";
import {BehaviorSubject, delay, filter, forkJoin, Observable, of, switchMap, takeUntil} from "rxjs";
// import {SpecialistGenderEnum, SpecialistGenderTypeEnum} from "../../enums/specialist-gender.enum";
import {FormBuilder} from "@angular/forms";
// import {EmployeeInfoFacade} from "../../employee-info.facade";
import {HomeLayoutState} from "../../../home-layout/home-layout.state";
import {NavigateButtonFacade} from "../../../../ui-kit/navigate-button/navigate-button.facade";
import {LocalStorageService} from "../../../../root-modules/app/services/local-storage.service";
import {HelperService} from "../../../service/helper.service";
import {RobotHelperService} from "../../../../root-modules/app/services/robot-helper.service";
import {Router} from "@angular/router";
import {Unsubscribe} from "../../../../shared-modules/unsubscriber/unsubscribe";
import {DateFormatEnum} from "src/app/modules/employee-info/enums/date-format.enum";
import {EmployeeInfoFacade} from "../utils/employee-info.facade";
import {ProfileFormControlService} from "../profile-edit/profile-form-control.service";
import {ProfileViewService} from "./profile-view.service";
import {SpecialistGenderEnum, SpecialistGenderTypeEnum} from "../../../employee-info/enums/specialist-gender.enum";
import {ShowLoaderService} from "../../../../ui-kit/hr-loader/show-loader.service";

@Component({
  selector: "app-profile-view",
  templateUrl: "./profile-view.component.html",
  styleUrls: ["./profile-view.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileViewComponent extends Unsubscribe implements OnInit, OnDestroy {
  public dateFormat = DateFormatEnum;
  public tagTypesList = TagTypesEnum;
  public specialistGenderTypeEnum = SpecialistGenderTypeEnum;
  public specialistGenderEnum = SpecialistGenderEnum;

  public programmingLang: string [] = [];
  public programmingFrame: string [] = [];
  public employeeInfo: BehaviorSubject<IEmployee | null> =
    new BehaviorSubject<IEmployee | null>(null);

  public employeeResume: boolean = false;
  public specialistForResume!: IEmployee;
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public specialistInfo: BehaviorSubject<IEmployee | null> =
    new BehaviorSubject<IEmployee | null>(null);

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _employeeFacade: EmployeeInfoFacade,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
    private readonly _localStorage: LocalStorageService,
    public readonly helperService: HelperService,
    public readonly _robotHelperService: RobotHelperService,
    public readonly _router: Router,
    public readonly profileFormService1: ProfileFormControlService,
    public readonly profileViewService: ProfileViewService,
    public readonly _showLoaderService: ShowLoaderService,
    private _cdr: ChangeDetectorRef,

  ) {
    super();
  }

  public ngOnInit(): void {
    this.isLoader$.next(true);

    this._localStorage.resume$
      .pipe(
        filter(data => !!data),
        takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        if (data?.name) {
          this.employeeInfo.next(data);
          this.specialistInfo.next(data);
          this._homeLayoutState.updateNavigationButtonsHandler();
          this.openNextPage();
          this.isLoader$.next(false);
        }
      });
  }

  public openNextPage(): void {
    const specialist = this.employeeInfo.value;
    const testsIndex = specialist?.robot_helper?.findIndex((data) =>
      data["link"] === "/employee/create-test/isActive") ?? -1;

    if (specialist && specialist?.robot_helper && !specialist.robot_helper[testsIndex]["hidden"] && testsIndex >= 0) {
      specialist.robot_helper[testsIndex]["hidden"] = true;
      this._localStorage.setItem("resume", JSON.stringify(specialist));
      this._homeLayoutState.updateNavigationButtonsHandler();
      this._employeeFacade.updateCurrentPageRobot(specialist.robot_helper[testsIndex]["uuid"])
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.isRobot();
        });
    }
    this.specialistInfo.subscribe((resume) => {
      // @ts-ignore
      const parseLanguagesAndFrameworks = JSON.parse(resume?.languagesFrameworksObjects);
      const languages: any[] = [];
      const frameworks: any[] = [];

      parseLanguagesAndFrameworks.forEach((langAndFrame: []) => {
        languages.push(Object.keys(langAndFrame));
        frameworks.push(Object.values(langAndFrame));
      });

      this.programmingLang = languages.join(" ").split(",");
      this.programmingFrame = frameworks.filter((frame) => frame[0].length > 0).join(" ").split(",");
      this._cdr.detectChanges();
    });
  }


  public isRobot(): void {
    if (this.employeeInfo.value) {
      const currentPage = this.employeeInfo.value?.robot_helper?.find(((item: { link: string; }) =>
        item.link === "/employee/employee-info"));

      this._robotHelperService.setRobotSettings({
        content: "Resume step 2 - helper",
        navigationItemId: 2,
        isContentActive: false,
      });

      if (currentPage && !currentPage?.hidden) {
        this._robotHelperService.setRobotSettings({
          content: "Resume - step - 2",
          navigationItemId: 2,
          isContentActive: false,
          uuid: currentPage?.uuid
        });
        this._robotHelperService.isRobotOpen$.next(true);
      }
    }

  }

  public editResume(): void {
    this._localStorage.setItem("resumeMode", JSON.stringify("EDIT"));
    this._localStorage.setItem("firstInit", JSON.stringify(true));
    this._router.navigateByUrl("/employee/resume/edit/info");
  }

  public downloadPdf() {
    this._showLoaderService.setIsLoading(true);
    this.profileViewService.downloadPdf()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((blob: Blob) => {
        const a = document.createElement("a");
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = `${this.specialistInfo.value?.name} ${this.specialistInfo.value?.surname}.pdf`;
        a.click();
        URL.revokeObjectURL(objectUrl);
        this._showLoaderService.setIsLoading(false);
      });
  }

  public get changeGenderValue() {
    return (this.specialistInfo.value && this.specialistInfo.value?.gender === this.specialistGenderTypeEnum.Male)
      ? this.specialistGenderEnum.Male : this.specialistGenderEnum.Female;
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
