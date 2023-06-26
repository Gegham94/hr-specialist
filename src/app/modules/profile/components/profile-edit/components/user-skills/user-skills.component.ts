import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {BehaviorSubject, Observable, of, switchMap, takeUntil, combineLatest, tap} from "rxjs";

import {
  SearchableSelectDataInterface,
  StringOrNumber,
} from "src/app/root-modules/app/interfaces/searchable-select-data.interface";
import {LocalStorageService} from "src/app/root-modules/app/services/local-storage.service";
import {EmployeeInfoFacade} from "src/app/modules/profile/components/utils/employee-info.facade";
import {ProfileFormControlService} from "./../../profile-form-control.service";
import {PREV_ICON, SKILLS_ICON} from "src/app/shared/constants/images.constant";
import {languages} from "src/app/modules/employee-info/mock/specialist-mock";
import {Unsubscribe} from "src/app/shared-modules/unsubscriber/unsubscribe";
import {ResumeRoutesEnum} from "../../../utils/resume-routes.constant";
import {Router} from "@angular/router";
import {startWith, take} from "rxjs/operators";
import {HomeLayoutState} from "../../../../../home-layout/home-layout.state";
import {ShowLoaderService} from "../../../../../../ui-kit/hr-loader/show-loader.service";
import {ScreenSizeService} from "src/app/root-modules/app/services/screen-size.service";
import {NavigateButtonFacade} from "../../../../../../ui-kit/navigate-button/navigate-button.facade";

@Component({
  selector: "app-user-skills",
  templateUrl: "./user-skills.component.html",
  styleUrls: ["./user-skills.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSkillsComponent extends Unsubscribe implements OnInit, OnDestroy, AfterViewInit {
  public SKILLS_ICON = SKILLS_ICON;

  // field options
  public languages: SearchableSelectDataInterface[] = languages;
  public programmingLanguageOptions$!: Observable<SearchableSelectDataInterface[] | null>;
  public frameworkOptions$: Observable<SearchableSelectDataInterface[] | null> =
    this.employeeFacade.getProgrammingFrameworksRequest$();

  // loaders
  public programmingLanguageLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public frameworkLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private selectedProgrammingLanguagesBackup: StringOrNumber[] = [];

  public PREV_ICON = PREV_ICON;
  public ResumeRoutesEnum = ResumeRoutesEnum;
  public isLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private resizeObserver!: ResizeObserver;

  @ViewChild("contentWrapper") contentWrapper!: ElementRef<HTMLDivElement>;

  public get skillsForm(): FormGroup {
    return this.formControlService.skillsForm;
  }

  public get isFrameworkSelectDisabled(): boolean {
    return !this.skillsForm.get("programmingLanguages")?.value.length;
  }

  constructor(
    private formControlService: ProfileFormControlService,
    private localStorageService: LocalStorageService,
    private screenSizeService: ScreenSizeService,
    private employeeFacade: EmployeeInfoFacade,
    private localStorage: LocalStorageService,
    private homeLayoutState: HomeLayoutState,
    private profileFormControlService: ProfileFormControlService,
    private showLoaderService: ShowLoaderService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private navigateButtonFacade: NavigateButtonFacade
  ) {
    super();
  }

  ngOnInit(): void {
    this.skillsForm.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((form) =>
          this.formControlService.storeSkillsForm({
            id: 4,
            ...this.skillsForm.value,
          })
        )
      )
      .subscribe();

    this.employeeFacade
      .setAllProgrammingLanguagesRequest$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.programmingLanguageOptions$ = this.employeeFacade.getAllProgrammingLanguages().pipe(
          takeUntil(this.ngUnsubscribe),
          tap(() => {})
        );
        this.programmingLanguageLoader$.next(false);
        this.cdr.detectChanges();
      });
    this.programmingLanguageChange();
  }

  ngAfterViewInit(): void {
    this.initContentSizeObserver();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    this.resizeObserver.unobserve(this.contentWrapper.nativeElement);
  }

  public goToUrl(url: string) {
    this.router.navigateByUrl(url);
  }

  public onFormSubmit() {
    this.showLoaderService.setIsLoading(true);
    this.profileFormControlService
      .getDbProfileDataForSend()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        take(1),
        switchMap((data) => {
          const navigationBtns = this.navigateButtonFacade.getShowedNavigationsMenu();
          if (navigationBtns) {

            const employeeIsActiveIndex = navigationBtns.findIndex(btn => btn.id === 1);
            const findTestsIsActiveIndex = navigationBtns.findIndex(btn => btn.id === 2);
            const companySearchIsActiveIndex = navigationBtns.findIndex(btn => btn.id === 3);
            const analyticsIsActiveIndex = navigationBtns.findIndex(btn => btn.id === 4);
            const chatIsActiveIndex = navigationBtns.findIndex(btn => btn.id === 5);

            if (employeeIsActiveIndex > -1
              && findTestsIsActiveIndex > -1
              && companySearchIsActiveIndex > -1
              && analyticsIsActiveIndex > -1
              && chatIsActiveIndex > -1
            ) {
              navigationBtns[employeeIsActiveIndex].statusType = "default";
              navigationBtns[findTestsIsActiveIndex].statusType = "default";
              navigationBtns[companySearchIsActiveIndex].statusType = "default";
              navigationBtns[analyticsIsActiveIndex].statusType = "default";
              navigationBtns[chatIsActiveIndex].statusType = "default";
            }
            this.navigateButtonFacade.setShowedNavigationsMenu$(navigationBtns);
          }
          return of(data);
        }),
        switchMap((data) => {
          const form_data = new FormData();
          for (const key in data) {
            if (key in data) {
              form_data.append(key, data[key]);
            }
          }
          form_data.delete("programmingLanguages");
          form_data.delete("programmingFrameworks");
          form_data.delete("id");
          // form_data.append("salary", "200EUR");
          return this.employeeFacade.saveResume(form_data).pipe(
            switchMap(() => {
              this.localStorageService.setItem("firstInit", JSON.stringify(true));
              const resume = JSON.parse(this.localStorage.getItem("resume"));
              if (resume) {
                const employeeIsActiveIndex = resume.robot_helper?.findIndex(
                  (item: { link: string }) => item.link === "/employee/employee-info/isActive"
                ) ?? -1;
                const findTestsIsActiveIndex = resume.robot_helper?.findIndex(
                  (item: { link: string }) => item.link === "/employee/create-test/isActive"
                ) ?? -1;
                const companySearchIsActiveIndex = resume.robot_helper?.findIndex(
                  (item: { link: string }) => item.link === "/employee/company-search/isActive"
                ) ?? -1;
                const analyticsIsActiveIndex = resume.robot_helper?.findIndex(
                  (item: { link: string }) => item.link === "/employee/analytics/isActive"
                ) ?? -1;
                const chatIsActiveIndex = resume.robot_helper?.findIndex(
                  (item: { link: string }) => item.link === "/employee/chat/isActive"
                ) ?? -1;

                if (employeeIsActiveIndex > -1 && findTestsIsActiveIndex > -1 && companySearchIsActiveIndex > -1
                  && analyticsIsActiveIndex > -1 && chatIsActiveIndex > -1
                  && !resume.robot_helper[employeeIsActiveIndex].hidden
                  && !resume.robot_helper[findTestsIsActiveIndex].hidden
                  && !resume.robot_helper[companySearchIsActiveIndex].hidden
                  && !resume.robot_helper[analyticsIsActiveIndex].hidden
                  && !resume.robot_helper[chatIsActiveIndex].hidden) {

                  resume.robot_helper[employeeIsActiveIndex].hidden = true;
                  resume.robot_helper[findTestsIsActiveIndex].hidden = true;
                  resume.robot_helper[companySearchIsActiveIndex].hidden = true;
                  resume.robot_helper[analyticsIsActiveIndex].hidden = true;
                  resume.robot_helper[chatIsActiveIndex].hidden = true;

                  this.localStorage.setItem("resume", JSON.stringify(resume));
                  this.homeLayoutState.updateNavigationButtonsHandler();
                  return combineLatest(
                    [
                      this.employeeFacade.updateCurrentPageRobot(resume.robot_helper[employeeIsActiveIndex]["uuid"]),
                      this.employeeFacade.updateCurrentPageRobot(resume.robot_helper[findTestsIsActiveIndex]["uuid"]),
                      this.employeeFacade.updateCurrentPageRobot(resume.robot_helper[companySearchIsActiveIndex]["uuid"]),
                      this.employeeFacade.updateCurrentPageRobot(resume.robot_helper[chatIsActiveIndex]["uuid"]),
                      this.employeeFacade.updateCurrentPageRobot(resume.robot_helper[analyticsIsActiveIndex]["uuid"]),
                    ]);
                }
                return of(null);
              }
              return of(null);
            })
          );
        })
      )
      .subscribe(() => {
        this.router.navigateByUrl("/employee/resume");
        this.showLoaderService.setIsLoading(false);
      }, () => {
        this.showLoaderService.setIsLoading(false);
      });
  }

  public getFormControlByName(controlName: string): FormControl {
    return this.skillsForm.get(controlName) as FormControl;
  }

  private programmingLanguageChange(): void {
    this.skillsForm
      .get("programmingLanguages")
      ?.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe),
      startWith(this.skillsForm.get("programmingLanguages")?.value),
      switchMap((selectedProgrammingLanguages: SearchableSelectDataInterface[]) => {
        this.frameworkLoader$.next(true);
        if (
          selectedProgrammingLanguages &&
          selectedProgrammingLanguages.length &&
          selectedProgrammingLanguages.every((language) =>
            this.selectedProgrammingLanguagesBackup.includes(language.id)
          )
        ) {
          const selectedLanguageIds = selectedProgrammingLanguages.map((language) => language.id);
          let selectedFrameworks: SearchableSelectDataInterface[] | null =
            this.skillsForm.get("programmingFrameworks")?.value;
          if (selectedFrameworks) {
            selectedFrameworks = selectedFrameworks.filter((framework) =>
              selectedLanguageIds.includes(framework.programmingLanguage?.uuid as StringOrNumber)
            );
          }

          this.skillsForm.get("programmingFrameworks")?.setValue(selectedFrameworks);
          return this.employeeFacade.addProgrammingFrameworks(
            {
              programmingLanguageUuids: JSON.stringify([...selectedLanguageIds]),
            },
            true
          );
        }
        if (selectedProgrammingLanguages && selectedProgrammingLanguages.length) {
          this.selectedProgrammingLanguagesBackup = selectedProgrammingLanguages.map((language) => language.id);
          const uuIds = selectedProgrammingLanguages.map((selectedLanguage) => selectedLanguage.id) as string[];
          return this.employeeFacade.addProgrammingFrameworks(
            {programmingLanguageUuids: JSON.stringify([...uuIds])},
            true
          );
        } else {
          this.skillsForm.get("programmingFrameworks")?.setValue(null);
          return of([]);
        }
      })
    )
      .subscribe(() => {
        this.frameworkLoader$.next(false);
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
