import {Component, OnDestroy, OnInit} from "@angular/core";
import {EmployeeInterface} from "../../../../root-modules/app/interfaces/employee.interface";
import {DateFormatEnum} from "../../enums/date-format.enum";
import {TagTypesEnum} from "../../../../root-modules/app/constants/tag-types.enum";
import {BehaviorSubject, filter, takeUntil} from "rxjs";
import {SpecialistGenderEnum, SpecialistGenderTypeEnum} from "../../enums/specialist-gender.enum";
import {FormBuilder} from "@angular/forms";
import {EmployeeInfoFacade} from "../../../profile/components/utils/employee-info.facade";
import {HomeLayoutState} from "../../../home-layout/home-layout.state";
import {NavigateButtonFacade} from "../../../../ui-kit/navigate-button/navigate-button.facade";
import {LocalStorageService} from "../../../../root-modules/app/services/local-storage.service";
import {HelperService} from "../../../service/helper.service";
import {RobotHelperService} from "../../../../root-modules/app/services/robot-helper.service";
import {Router} from "@angular/router";
import {Unsubscribe} from "../../../../shared-modules/unsubscriber/unsubscribe";

@Component({
  selector: "app-resume",
  templateUrl: "./resume.component.html",
  styleUrls: ["./resume.component.scss"]
})
export class ResumeComponent extends Unsubscribe implements OnInit, OnDestroy {
  public dateFormat = DateFormatEnum;
  public tagTypesList = TagTypesEnum;
  public specialistGenderTypeEnum = SpecialistGenderTypeEnum;
  public specialistGenderEnum = SpecialistGenderEnum;

  public programmingLang: string [] = [];
  public programmingFrame: string [] = [];
  public employeeInfo: BehaviorSubject<EmployeeInterface | null> =
    new BehaviorSubject<EmployeeInterface | null>(null);

  public employeeResume: boolean = false;
  public specialistForResume!: EmployeeInterface;
  public isLoadSpecialist$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public specialistInfo: BehaviorSubject<EmployeeInterface | null> =
    new BehaviorSubject<EmployeeInterface | null>(null);

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _employeeFacade: EmployeeInfoFacade,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
    private readonly _localStorage: LocalStorageService,
    public readonly helperService: HelperService,
    public readonly _robotHelperService: RobotHelperService,
    public readonly _router: Router,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.isLoadSpecialist$.next(true);

    this._localStorage.updateResume
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
        this.employeeInfo.next(JSON.parse(this._localStorage.getItem("resume")) as EmployeeInterface);
        this.openNextPage();
      });

    this.employeeInfo
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.specialistInfo.next(data);
        this.isLoadSpecialist$.next(false);
      });
  }

  public openNextPage(): void {
    const specialist = this.employeeInfo.value;
    const testsIndex = specialist?.robot_helper?.findIndex((data) =>
      data["link"] === "/employee/create-test/isActive") ?? -1;

    if (specialist && specialist?.robot_helper && testsIndex >= 0) {
      specialist.robot_helper[testsIndex]["hidden"] = true;
      this._localStorage.setItem("resume", JSON.stringify(specialist));
      this._homeLayoutState.updateNavigationButtonsHandler();
      this._employeeFacade.updateCurrentPageRobot(specialist.robot_helper[testsIndex]["uuid"])
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.isRobot();
        });
    }
    this.specialistInfo.pipe(
      takeUntil(this.ngUnsubscribe),
      filter((resume) => !!resume?.languagesFrameworksObjects)
    ).subscribe((resume) => {
      // @ts-ignore
      const parseLanguagesAndFrameworks = JSON.parse(resume?.languagesFrameworksObjects);
      const languages: any[] = [];
      const frameworks: any[] = [];

      parseLanguagesAndFrameworks.forEach((langAndFrame: []) => {
        languages.push(Object.keys(langAndFrame));
        frameworks.push(Object.values(langAndFrame));
      });

      this.programmingLang = languages.join(" ").split(" ");
      this.programmingFrame = frameworks.filter((frame) => frame[0].length > 0).join(" ").split(",");

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
    this._router.navigateByUrl("/employee/resume/edit/info");
  }

  public get changeGenderValue() {
    return (this.specialistInfo.value && this.specialistInfo.value?.gender === this.specialistGenderTypeEnum.Male)
      ? this.specialistGenderEnum.Male : this.specialistGenderEnum.Female;
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
