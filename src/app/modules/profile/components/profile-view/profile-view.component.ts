import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { OnDestroy, OnInit } from "@angular/core";
import { IEmployee } from "../../../../shared/interfaces/employee.interface";
import { BehaviorSubject, takeUntil, tap } from "rxjs";
import { HomeLayoutState } from "../../../home-layout/home-layout.state";
import { LocalStorageService } from "../../../../shared/services/local-storage.service";
import { RobotHelperService } from "../../../../shared/services/robot-helper.service";
import { Router } from "@angular/router";
import { Unsubscribe } from "../../../../shared/unsubscriber/unsubscribe";
import { EmployeeInfoFacade } from "../../services/employee-info.facade";
import { ProfileViewService } from "./service/profile-view.service";
import { SpecialistGenderEnum, SpecialistGenderTypeEnum } from "../../enums/specialist-gender.enum";
import { ShowLoaderService } from "../../../../ui-kit/hr-loader/show-loader.service";
import { ScreenSizeService } from "../../../../shared/services/screen-size.service";
import { ScreenSizeEnum } from "../../../../shared/constants/screen-size.enum";
import { TagTypesEnum } from "src/app/shared/constants/tag-types.enum";
import { ScreenSizeType } from "src/app/shared/interfaces/screen-size.type";

@Component({
  selector: "app-profile-view",
  templateUrl: "./profile-view.component.html",
  styleUrls: ["./profile-view.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileViewComponent extends Unsubscribe implements OnInit, OnDestroy {
  public tagTypesList = TagTypesEnum;
  public screenSizeType: BehaviorSubject<ScreenSizeType> = new BehaviorSubject<ScreenSizeType>(ScreenSizeEnum.DESKTOP);
  public specialistInfo: BehaviorSubject<IEmployee | null> = new BehaviorSubject<IEmployee | null>(null);
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly ScreenSizeEnum = ScreenSizeEnum;
  public programmingLang: string[] = [];
  public programmingFrame: string[] = [];

  private specialistGenderTypeEnum = SpecialistGenderTypeEnum;
  private specialistGenderEnum = SpecialistGenderEnum;
  private employeeInfo: BehaviorSubject<IEmployee | null> = new BehaviorSubject<IEmployee | null>(null);

  constructor(
    private readonly _employeeFacade: EmployeeInfoFacade,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _localStorage: LocalStorageService,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _router: Router,
    private readonly _profileViewService: ProfileViewService,
    private readonly _showLoaderService: ShowLoaderService,
    private readonly _screenSizeService: ScreenSizeService,
    private _cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnInit(): void {
    this.isLoader$.next(true);
    this.screenSizeType.next(this._screenSizeService.calcScreenSize);
    this._screenSizeService.screenSize$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((type: ScreenSizeType) => {
      this.screenSizeType.next(type);
      this._cdr.detectChanges();
    });

    this._employeeFacade
      .getEmployee$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap((resume: IEmployee) => {
          if (resume?.name) {
            this.employeeInfo.next(resume);
            this.specialistInfo.next(resume);
            this._homeLayoutState.updateNavigationButtonsHandler();
            this.openNextPage();
            this.isLoader$.next(false);
          }
        })
      )
      .subscribe();
  }

  public openNextPage(): void {
    const specialist = this.employeeInfo.value;
    const testsIndex =
      specialist?.robot_helper?.findIndex((data) => data["link"] === "/employee/create-test/isActive") ?? -1;
    if (specialist && specialist?.robot_helper && !specialist.robot_helper[testsIndex]["hidden"] && testsIndex >= 0) {
      specialist.robot_helper[testsIndex]["hidden"] = true;
      this._localStorage.setItem("resume", JSON.stringify(specialist));
      this._homeLayoutState.updateNavigationButtonsHandler();
      this._employeeFacade
        .updateCurrentPageRobot(specialist.robot_helper[testsIndex]["uuid"])
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
      this.programmingFrame = frameworks
        .filter((frame) => frame[0].length > 0)
        .join(" ")
        .split(",");
      this._cdr.detectChanges();
    });
  }

  public isRobot(): void {
    if (this.employeeInfo.value) {
      const currentPage = this.employeeInfo.value?.robot_helper?.find(
        (item: { link: string }) => item.link === "/employee/employee-info"
      );
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
          uuid: currentPage?.uuid,
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
    this._profileViewService
      .downloadPdf()
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
    return this.specialistInfo.value && this.specialistInfo.value?.gender === this.specialistGenderTypeEnum.Male
      ? this.specialistGenderEnum.Male
      : this.specialistGenderEnum.Female;
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
