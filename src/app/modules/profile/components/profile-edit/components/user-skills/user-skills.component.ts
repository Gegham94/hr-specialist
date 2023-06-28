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
import { FormControl, FormGroup } from "@angular/forms";
import { BehaviorSubject, Observable, of, switchMap, takeUntil, tap } from "rxjs";
import { EmployeeInfoFacade } from "src/app/modules/profile/services/employee-info.facade";
import { PREV_ICON, SKILLS_ICON } from "src/app/shared/constants/images.constant";
import { languages } from "src/app/modules/profile/mock/specialist-mock";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { ResumeRoutesEnum } from "../../../../constants/resume-routes.constant";
import { Router } from "@angular/router";
import { startWith, take } from "rxjs/operators";
import { ShowLoaderService } from "../../../../../../ui-kit/hr-loader/show-loader.service";
import { ScreenSizeService } from "src/app/shared/services/screen-size.service";
import { NavigateButtonFacade } from "../../../../../../ui-kit/navigate-button/navigate-button.facade";
import { ProfileEditFacade } from "../../service/profile-edit.facade";
import { ISearchableSelectData, StringOrNumberType } from "src/app/shared/interfaces/searchable-select-data.interface";

@Component({
  selector: "app-user-skills",
  templateUrl: "./user-skills.component.html",
  styleUrls: ["./user-skills.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSkillsComponent extends Unsubscribe implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("contentWrapper") contentWrapper!: ElementRef<HTMLDivElement>;

  public SKILLS_ICON = SKILLS_ICON;

  // field options
  public languages: ISearchableSelectData[] = languages;
  public programmingLanguageOptions$!: Observable<ISearchableSelectData[] | null>;
  public frameworkOptions$: Observable<ISearchableSelectData[] | null> =
    this._employeeFacade.getProgrammingFrameworksRequest$();

  // loaders
  public programmingLanguageLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public frameworkLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public PREV_ICON = PREV_ICON;
  public ResumeRoutesEnum = ResumeRoutesEnum;

  private resizeObserver!: ResizeObserver;
  private selectedProgrammingLanguagesBackup: StringOrNumberType[] = [];

  public get skillsForm(): FormGroup {
    return this._profileEditFacade.getSkillsForm();
  }

  public get isFrameworkSelectDisabled(): boolean {
    return !this.skillsForm.get("programmingLanguages")?.value.length;
  }

  constructor(
    private _profileEditFacade: ProfileEditFacade,
    private _screenSizeService: ScreenSizeService,
    private _employeeFacade: EmployeeInfoFacade,
    private _showLoaderService: ShowLoaderService,
    private _router: Router,
    private _cdr: ChangeDetectorRef,
    private _navigateButtonFacade: NavigateButtonFacade
  ) {
    super();
  }

  ngOnInit(): void {
    this.skillsForm.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((form) =>
          this._profileEditFacade.storeSkillsForm({
            id: 4,
            ...this.skillsForm.value,
          })
        )
      )
      .subscribe();

    this._employeeFacade
      .setAllProgrammingLanguagesRequest$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.programmingLanguageOptions$ = this._employeeFacade.getAllProgrammingLanguages().pipe(
          takeUntil(this.ngUnsubscribe),
          tap(() => {})
        );
        this.programmingLanguageLoader$.next(false);
        this._cdr.markForCheck();
      });
    this.programmingLanguageChange();
  }

  public ngAfterViewInit(): void {
    this.initContentSizeObserver();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
    this.resizeObserver.unobserve(this.contentWrapper.nativeElement);
  }

  public goToUrl(url: string) {
    this._router.navigateByUrl(url);
  }

  public onFormSubmit() {
    this._showLoaderService.setIsLoading(true);
    this._profileEditFacade
      .getDbProfileDataForSend()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        take(1),
        switchMap((data) => {
          let navigationBtns = this._navigateButtonFacade.getShowedNavigationsMenu();
          if (navigationBtns) {
            navigationBtns = this._profileEditFacade.getUpdatedNavigationBtns(navigationBtns);
            this._navigateButtonFacade.setShowedNavigationsMenu$(navigationBtns);
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
          return this._employeeFacade.saveResume(form_data).pipe(
            takeUntil(this.ngUnsubscribe),
            switchMap(() => {
              this._profileEditFacade.setItem("firstInit", JSON.stringify(true));
              const resume = JSON.parse(this._profileEditFacade.getItem("resume"));
              if (resume) {
                return this._profileEditFacade.getUpdatedResume(resume);
              }
              return of(null);
            })
          );
        })
      )
      .subscribe(
        () => {
          this._router.navigateByUrl("/employee/resume");
          this._showLoaderService.setIsLoading(false);
        },
        () => {
          this._showLoaderService.setIsLoading(false);
        }
      );
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
        switchMap((selectedProgrammingLanguages: ISearchableSelectData[]) => {
          this.frameworkLoader$.next(true);
          if (
            selectedProgrammingLanguages &&
            selectedProgrammingLanguages.length &&
            selectedProgrammingLanguages.every((language) =>
              this.selectedProgrammingLanguagesBackup.includes(language.id)
            )
          ) {
            const selectedLanguageIds = selectedProgrammingLanguages.map((language) => language.id);
            let selectedFrameworks: ISearchableSelectData[] | null =
              this.skillsForm.get("programmingFrameworks")?.value;
            if (selectedFrameworks) {
              selectedFrameworks = selectedFrameworks.filter((framework) =>
                selectedLanguageIds.includes(framework.programmingLanguage?.uuid as StringOrNumberType)
              );
            }

            this.skillsForm.get("programmingFrameworks")?.setValue(selectedFrameworks);
            return this._employeeFacade.addProgrammingFrameworks(
              {
                programmingLanguageUuids: JSON.stringify([...selectedLanguageIds]),
              },
              true
            );
          }
          if (selectedProgrammingLanguages && selectedProgrammingLanguages.length) {
            this.selectedProgrammingLanguagesBackup = selectedProgrammingLanguages.map((language) => language.id);
            const uuIds = selectedProgrammingLanguages.map((selectedLanguage) => selectedLanguage.id) as string[];
            return this._employeeFacade.addProgrammingFrameworks(
              { programmingLanguageUuids: JSON.stringify([...uuIds]) },
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
        this._screenSizeService.setProfilEditLayoutSize(contentRect.height + 120);
      }
    });
    this.resizeObserver.observe(this.contentWrapper.nativeElement);
  }
}
