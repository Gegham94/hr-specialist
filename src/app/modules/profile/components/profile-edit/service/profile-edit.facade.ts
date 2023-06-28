import { Injectable } from "@angular/core";
import { Observable, Subject, combineLatest, of } from "rxjs";
import { ProfileFormControlService } from "./profile-form-control.service";
import { FormGroup } from "@angular/forms";
import {
  IEducation,
  IEducationItem,
  IExperiences,
  IProfileInfo,
  IUserSkills,
  IWorkExperience,
} from "../../../interfaces/profile-form.interface";
import { HomeLayoutState } from "src/app/modules/home-layout/home-layout.state";
import { LocalStorageService } from "src/app/shared/services/local-storage.service";
import { EmployeeInfoFacade } from "../../../services/employee-info.facade";
import { NavigationButton } from "src/app/shared/interfaces/navigateButton.interface";

@Injectable({
  providedIn: "root",
})
export class ProfileEditFacade {
  constructor(
    private _formControlService: ProfileFormControlService,
    private _homeLayoutState: HomeLayoutState,
    private _localStorageService: LocalStorageService,
    private _employeeFacade: EmployeeInfoFacade
  ) {}

  public updateNavigationButtonsHandler(): void {
    this._homeLayoutState.updateNavigationButtonsHandler();
  }

  // Getters
  public getInfoForm(): FormGroup<any> {
    return this._formControlService.infoForm;
  }

  public getSkillsForm(): FormGroup<any> {
    return this._formControlService.skillsForm;
  }

  public getInfoChange$(): Subject<void> {
    return this._formControlService.infoChange$;
  }

  public getSavedEducationChange$(): Subject<void> {
    return this._formControlService.savedEducationChange$;
  }

  public getSavedExperienceChange$(): Subject<void> {
    return this._formControlService.savedExperienceChange$;
  }

  public getSkillsChange$(): Subject<void> {
    return this._formControlService.skillsChange$;
  }

  public getEducationForm(): FormGroup<any> {
    return this._formControlService.educationForm;
  }

  public getSavedEducation(): IEducationItem[] {
    return this._formControlService.savedEducation;
  }

  public getEducationById(id: number): Observable<IEducation> {
    return this._formControlService.getEducationById(id);
  }

  public getExperienceForm(): FormGroup<any> {
    return this._formControlService.experienceForm;
  }

  public getSavedExperiences(): IWorkExperience[] {
    return this._formControlService.savedExperiences;
  }

  public getExperienceById(id: number): Observable<IExperiences> {
    return this._formControlService.getExperienceById(id);
  }

  public getDbProfileDataForSend() {
    return this._formControlService.getDbProfileDataForSend();
  }

  public getUpdatedNavigationBtns(navigationBtns: NavigationButton[]): NavigationButton[] {
    const employeeIsActiveIndex = navigationBtns.findIndex((btn) => btn.id === 1);
    const findTestsIsActiveIndex = navigationBtns.findIndex((btn) => btn.id === 2);
    const companySearchIsActiveIndex = navigationBtns.findIndex((btn) => btn.id === 3);
    const analyticsIsActiveIndex = navigationBtns.findIndex((btn) => btn.id === 4);
    const chatIsActiveIndex = navigationBtns.findIndex((btn) => btn.id === 5);

    if (
      employeeIsActiveIndex > -1 &&
      findTestsIsActiveIndex > -1 &&
      companySearchIsActiveIndex > -1 &&
      analyticsIsActiveIndex > -1 &&
      chatIsActiveIndex > -1
    ) {
      navigationBtns[employeeIsActiveIndex].statusType = "default";
      navigationBtns[findTestsIsActiveIndex].statusType = "default";
      navigationBtns[companySearchIsActiveIndex].statusType = "default";
      navigationBtns[analyticsIsActiveIndex].statusType = "default";
      navigationBtns[chatIsActiveIndex].statusType = "default";
    }
    return navigationBtns;
  }

  public getItem(key: string): string {
    return this._localStorageService.getItem("resume");
  }

  public getUpdatedResume(resume: any) {
    const employeeIsActiveIndex =
      resume.robot_helper?.findIndex((item: { link: string }) => item.link === "/employee/employee-info/isActive") ??
      -1;
    const findTestsIsActiveIndex =
      resume.robot_helper?.findIndex((item: { link: string }) => item.link === "/employee/create-test/isActive") ?? -1;
    const companySearchIsActiveIndex =
      resume.robot_helper?.findIndex((item: { link: string }) => item.link === "/employee/company-search/isActive") ??
      -1;
    const analyticsIsActiveIndex =
      resume.robot_helper?.findIndex((item: { link: string }) => item.link === "/employee/analytics/isActive") ?? -1;
    const chatIsActiveIndex =
      resume.robot_helper?.findIndex((item: { link: string }) => item.link === "/employee/chat/isActive") ?? -1;
    if (
      employeeIsActiveIndex > -1 &&
      findTestsIsActiveIndex > -1 &&
      companySearchIsActiveIndex > -1 &&
      analyticsIsActiveIndex > -1 &&
      chatIsActiveIndex > -1 &&
      !resume.robot_helper[employeeIsActiveIndex].hidden &&
      !resume.robot_helper[findTestsIsActiveIndex].hidden &&
      !resume.robot_helper[companySearchIsActiveIndex].hidden &&
      !resume.robot_helper[analyticsIsActiveIndex].hidden &&
      !resume.robot_helper[chatIsActiveIndex].hidden
    ) {
      resume.robot_helper[employeeIsActiveIndex].hidden = true;
      resume.robot_helper[findTestsIsActiveIndex].hidden = true;
      resume.robot_helper[companySearchIsActiveIndex].hidden = true;
      resume.robot_helper[analyticsIsActiveIndex].hidden = true;
      resume.robot_helper[chatIsActiveIndex].hidden = true;

      this._localStorageService.setItem("resume", JSON.stringify(resume));
      this.updateNavigationButtonsHandler();
      return combineLatest([
        this._employeeFacade.updateCurrentPageRobot(resume.robot_helper[employeeIsActiveIndex]["uuid"]),
        this._employeeFacade.updateCurrentPageRobot(resume.robot_helper[findTestsIsActiveIndex]["uuid"]),
        this._employeeFacade.updateCurrentPageRobot(resume.robot_helper[companySearchIsActiveIndex]["uuid"]),
        this._employeeFacade.updateCurrentPageRobot(resume.robot_helper[chatIsActiveIndex]["uuid"]),
        this._employeeFacade.updateCurrentPageRobot(resume.robot_helper[analyticsIsActiveIndex]["uuid"]),
      ]);
    }
    return of(null);
  }

  // Setters
  public storeEducationForm(education: IEducation): Observable<IEducation> {
    return this._formControlService.storeEducationForm(education);
  }

  public storeExperienceForm(experiences: IExperiences): Observable<IExperiences> {
    return this._formControlService.storeExperienceForm(experiences);
  }

  public storeInfoForm(infoForm: IProfileInfo): Observable<IProfileInfo> {
    return this._formControlService.storeInfoForm(infoForm);
  }

  public storeSkillsForm(skills: IUserSkills): Observable<IUserSkills> {
    return this._formControlService.storeSkillsForm(skills);
  }

  public setItem(key: string, value: string) {
    this._localStorageService.setItem(key, value);
  }
}
