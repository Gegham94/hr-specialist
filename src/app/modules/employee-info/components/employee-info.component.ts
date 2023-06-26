import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import {
  BehaviorSubject,
  combineLatest,
  filter,
  Observable,
  of,
  pairwise,
  startWith,
  switchMap,
  takeUntil,
} from "rxjs";
import { EmployeeInfoFacade } from "../../profile/components/utils/employee-info.facade";
import { TagTypesEnum } from "../../../root-modules/app/constants/tag-types.enum";
import { EmployeeInterface } from "../../../root-modules/app/interfaces/employee.interface";
import { EmployeeSkillsEnum } from "../enums/specialist-skils.enum";
import {
  citizenShips,
  educations,
  employments,
  faculties,
  genders,
  languages,
  price,
  specialistPosition,
} from "../mock/specialist-mock";
import { DateFormatEnum } from "../enums/date-format.enum";
import {
  SearchableSelectDataInterface,
  StringOrNumber,
} from "../../../root-modules/app/interfaces/searchable-select-data.interface";
import { SendFormService } from "../../service/send-form.service";
import { HelperService } from "../../service/helper.service";
import { HomeLayoutState } from "../../home-layout/home-layout.state";
import { SearchParams } from "../interface/search-params";
import { PatternModel } from "../../auth/enum/pattern.model";
import { LocalStorageService } from "../../../root-modules/app/services/local-storage.service";
import { Unsubscribe } from "../../../shared-modules/unsubscriber/unsubscribe";
import { RobotHelperService } from "../../../root-modules/app/services/robot-helper.service";
import { SpecialistGenderEnum, SpecialistGenderTypeEnum } from "../enums/specialist-gender.enum";

@Component({
  selector: "hr-company-info",
  templateUrl: "./employee-info.component.html",
  styleUrls: ["./employee-info.component.scss"],
})
export class EmployeeInfoComponent {
//   public employeeRegisterForm!: FormGroup;
//   public tagTypesList = TagTypesEnum;
//   public languagesFrameworks: any = [];
//   public specialistForResume!: EmployeeInterface;
//   public accardion$!: Observable<any>;
//   public dateFormat = DateFormatEnum;
//   public skillProgrammingLanguages: any = [];
//   public experienceItem?: number = 0;
//   public educationItem?: number;
//   public editWorkExp: boolean = false;
//   public editEducation: boolean = false;
//   public employeeResume: boolean = false;
//   public employeeSkillsEnum = EmployeeSkillsEnum;
//   public isSelectionLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

//   private indexForExperience: number = 0;
//   private indexForEducation: number = 0;
//   private regexpForName = PatternModel.patternForName;
//   private educationAddedToCart: boolean = false;
//   private workExperienceAddedToCart: boolean = false;
//   private formFieldDateFromLocaleStorage!: EmployeeInterface;
//   private selectedProgrammingLanguagesBackup: StringOrNumber[] = [];
//   public startSearch: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

//   public searchParams: SearchParams = {
//     take: 0,
//     skip: 0,
//   };

//   public searchListProgrammingLanguages!: SearchableSelectDataInterface[];
//   public searchListProgrammingLanguages$ = this._employeeFacade
//     .getProgrammingLanguagesRequest$()
//     .subscribe((data) => {
//       this.searchListProgrammingLanguages = data;
//       this.isSelectionLoader.next(false);
//     });

//   public searchListUniversities!: SearchableSelectDataInterface[];
//   public searchListEmployments$ = this._employeeFacade.getUniversityRequest$().subscribe((data) => {
//     this.searchListUniversities = data;
//     this.isSelectionLoader.next(false);
//   });

//   public multiSelectedListProps$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

//   public searchListFrameworks!: SearchableSelectDataInterface[];

//   public x = this._employeeFacade.getAllProgrammingLanguages().subscribe((data) => {
//     this.allSelectedLanguages = data;
//   });

//   public y = this._employeeFacade.getAllProgrammingFrameworks().subscribe((data) => {
//     this.allSelectedFrameworks = data;
//   });

//   public allSelectedFrameworks!: SearchableSelectDataInterface[];
//   public allSelectedLanguages!: SearchableSelectDataInterface[];

//   public experienceDisabledBtn: boolean = true;
//   public educationDisabledBtn: boolean = true;

//   public currentPage: number = 0;
//   public employeeInfo: Observable<EmployeeInterface | null> = this._localStorage.getItem("resume")
//     ? this._localStorage.resume$
//     : this._employeeFacade.getEmployee$();
//   public isLoadSpecialist$: Observable<boolean> = of(false);

//   public specialistImage: any;

//   @ViewChild("step1") step1!: ElementRef;
//   @ViewChild("step2") step2!: ElementRef;
//   @ViewChild("step3") step3!: ElementRef;
//   @ViewChild("step4") step4!: ElementRef;
// private _test: string = "";
//   get test(): string {
//     console.log('test');

//     return this._test;
//   }

//   set test(value: string) {
//     this._test = value;
//   }

//   // OK variables
//   public price: SearchableSelectDataInterface[] = price;
//   public genders: SearchableSelectDataInterface[] = genders;
//   public languages: SearchableSelectDataInterface[] = languages;
//   public faculties: SearchableSelectDataInterface[] = faculties;
//   public educations: SearchableSelectDataInterface[] = educations;
//   public employments: SearchableSelectDataInterface[] = employments;
//   public citizenShips: SearchableSelectDataInterface[] = citizenShips;
//   public specialistPosition: SearchableSelectDataInterface[] = specialistPosition;

//   public searchListCountry$: Observable<SearchableSelectDataInterface[] | null> =
//     this._employeeFacade.getVacancyLocationCountriesRequest$();

//   public searchListCity$: Observable<SearchableSelectDataInterface[] | null> =
//     this._employeeFacade.getVacancyLocationCitiesRequest$();

//   constructor(
//     private readonly _formBuilder: FormBuilder,
//     private readonly _employeeFacade: EmployeeInfoFacade,
//     private readonly _homeLayoutState: HomeLayoutState,
//     private readonly _localStorage: LocalStorageService,
//     private readonly sendForm: SendFormService,
//     public readonly helperService: HelperService,
//     public readonly _robotHelperService: RobotHelperService,
//     public readonly _router: Router
//   ) {
//     super();
//   }

//   ngOnInit(): void {
//     this.initForm();
//     this.getResume();
//     this.countryChange();
//     this._employeeFacade.setLocationCountriesRequest$();

//     // this.accardion$ = this._employeeFacade.getAcardionActive$();
//     // Robot functionality
//     // this._employeeFacade.getSelectedContentReference().subscribe((data) => {
//     //   switch (data) {
//     //     case "step1": {
//     //       this.scrollToReference(this.step1);
//     //       break;
//     //     }
//     //     case "step2": {
//     //       this.scrollToReference(this.step2);
//     //       break;
//     //     }
//     //     case "step3": {
//     //       this.scrollToReference(this.step3);
//     //       break;
//     //     }
//     //     case "step4": {
//     //       this.scrollToReference(this.step4);
//     //       break;
//     //     }
//     //     default: {
//     //     }
//     //   }
//     // });

//     // this.disabledAddButton();
//     // this.selectFrameWorks();
//     // this.programmingLanguageChanges();
//     // this.programmingLanguageChange();

//     // this._employeeFacade.setAllProgrammingLanguagesRequest$().subscribe();
//     // this._employeeFacade.setAllProgrammingFrameworksRequest$(this.skillProgrammingLanguages).subscribe();
//     // this._employeeFacade.getProgrammingFrameworksRequest$()
//     //   .pipe(takeUntil(this.ngUnsubscribe))
//     //   .subscribe(data => {
//     //     this.searchListFrameworks = data;
//     //     this.isSelectionLoader.next(false);
//     //   });
//   }

//   // OK functions
//   public changeDisplayName(changeName: string | []): string | [] {
//     return typeof changeName === "string"
//       ? changeName
//       : changeName.length
//       ? changeName[0]["displayName"]
//       : "";
//   }

//   public getFormControlValidity(controlName: string): boolean | undefined {
//     if (this.getFormControlByName(controlName)) {
//       return this.getFormControlByName(controlName).touched
//         ? this.getFormControlByName(controlName).valid
//         : undefined;
//     }
//     return undefined;
//   }

//   public getFormControlValueByName(controlName: string): any {
//     this.getFormControlByName(controlName).value;
//   }

//   public selectBirthday(date: string): void {
//     this.getFormControlByName("dateOfBirth").setValue(date, { emitEvent: true });
//     this.getFormControlByName("dateOfBirth").updateValueAndValidity();
//   }

//   public onFormSubmit(form: FormGroup, employee: EmployeeInterface): void {
//     const formData = this.sendForm.mappingFormValueBeforeSend(
//       form,
//       employee,
//       this.languagesFrameworks,
//       this.educationAddedToCart,
//       this.workExperienceAddedToCart
//     );

//     this.employeeResume = true;
//     this.isLoadSpecialist$ = of(true); //make a subject
//     this._employeeFacade
//       .saveResume(formData)
//       .pipe(takeUntil(this.ngUnsubscribe))
//       .subscribe(() => {
//         this.isLoadSpecialist$ = of(false); //make a subject
//         this._router.navigateByUrl("/employee/employee-info");
//       });
//   }

//   public editResume(event: boolean): void {
//     this.employeeResume = event;
//     this.employeeRegisterForm.updateValueAndValidity(); //????
//   }

//   private getResume(): void {
//     this.employeeInfo = this._localStorage.getItem("resume")
//       ? this._localStorage.resume$
//       : this._employeeFacade.getEmployee$();

//     this.employeeInfo
//       .pipe(
//         takeUntil(this.ngUnsubscribe),
//         filter((specialist) => !!specialist)
//       )
//       .subscribe((specialist) => {
//         if (specialist) {
//           const requiredFieldsOfEmployee = {
//             name: specialist?.name,
//             surname: specialist?.surname,
//             email: specialist?.email,
//             uuid: specialist?.uuid,
//           };

//           const isRequiredFieldsOfEmployee =
//             this.helperService.isObjectValue(requiredFieldsOfEmployee);

//           if (isRequiredFieldsOfEmployee) {
//             this.employeeResume = true;
//             this.specialistForResume = specialist;
//             localStorage.setItem("file", specialist.image);
//             this.specialistImage = localStorage.getItem("file");
//             this.isLoadSpecialist$ = of(false);
//             this.employeeRegisterForm.patchValue(specialist);
//           } else {
//             if (specialist?.phone) {
//               this.getFormControlByName("phone").setValue(specialist.phone);
//             }
//             this.employeeResume = false;
//           }
//         }
//       });
//   }

//   private initForm(): void {
//     this.employeeRegisterForm = this._formBuilder.group({
//       name: ["", [Validators.required, Validators.pattern(this.regexpForName)]],
//       surname: ["", [Validators.required, Validators.pattern(this.regexpForName)]],
//       country: ["", [Validators.required]],
//       city: ["", [Validators.required]],
//       image: ["", [Validators.required]],
//       phone: ["", [Validators.required, Validators.minLength(10), Validators.maxLength(12)]],
//       email: ["", [Validators.required, Validators.email]],
//       gender: ["", Validators.required],
//       dateOfBirth: ["", Validators.required],
//       citizenship: ["", Validators.required],
//       employment: ["", Validators.required],
//       position: ["", Validators.required],
//       price: [""],
//       experiences: this._formBuilder.array([
//         new FormGroup({
//           company: new FormControl(""),
//           position: new FormControl(""),
//           accept_date: new FormControl(""),
//           quit_date: new FormControl(""),
//           work_yet: new FormControl(false),
//         }),
//       ]),
//       educations: this._formBuilder.array([
//         new FormGroup({
//           education_id: new FormControl(""),
//           faculty: new FormControl(""),
//           graduate_date: new FormControl(""),
//           trainingFormat: new FormControl(""),
//         }),
//       ]),
//       languages: [""],
//       programmingLang: [""],
//       languagesFrameworks: [""],
//     });
//   }

//   private countryChange(): void {
//     this.getFormControlByName("country")
//       ?.valueChanges.pipe(
//         takeUntil(this.ngUnsubscribe),
//         switchMap((selectedCountry: SearchableSelectDataInterface[] | string) => {
//           if (typeof this.getFormControlByName("city").value !== "string") {
//             this.getFormControlByName("city").setValue("");
//           }
//           if (typeof selectedCountry !== "string" && selectedCountry && selectedCountry.length) {
//             const uuId = selectedCountry[0].id as string;
//             return this._employeeFacade.setLocationCitiesRequest$({ countryId: uuId }, false);
//           }
//           return of(null);
//         })
//       )
//       .subscribe();
//   }

//   private getFormControlByName(controlName: string): FormControl {
//     return this.employeeRegisterForm.get(controlName) as FormControl;
//   }

//   ngOnDestroy(): void {
//     this.unsubscribe();
//   }
//   // end of OK functions

//   public dropdownLoader = {
//     skillsLanguages: true,
//     workExperience: false,
//     education: false,
//   };

//   public setDropdownLoader(item: EmployeeSkillsEnum, state: boolean) {
//     this.dropdownLoader[item] = state;
//   }

//   public isDropdownLoader(item: EmployeeSkillsEnum): boolean {
//     return this.dropdownLoader[item];
//   }

//   get programmingLangControl(): FormControl {
//     return this.employeeRegisterForm.get("programmingLang") as FormControl;
//   }

//   get programmingFrameControl(): FormControl {
//     return this.employeeRegisterForm.get("languagesFrameworks") as FormControl;
//   }

//   // public specialistExperienceAcceptDate(i: number): FormControl {
//   //   return this.experience?.controls[i]?.get("accept_date") as FormControl;
//   // }

//   // public specialistExperienceQuitDate(i: number): FormControl {
//   //   return this.experience.controls[i]?.get("quit_date") as FormControl;
//   // }

//   // public specialistGraduatedDate(i: number): FormControl {
//   //   return this.education?.controls[i].get("graduate_date") as FormControl;
//   // }

//   // Robot functionality
//   // public scrollToReference(item: ElementRef): void {
//   //   item?.nativeElement.scrollIntoView({behavior: "smooth", block: "start"});
//   // }

//   ngAfterViewInit() {
//     // this.isRobot();
//   }

//   // private isRobot() {
//   //   this.employeeInfo
//   //     .pipe(filter((data: EmployeeInterface) => !!data?.phone),
//   //       switchMap((data: EmployeeInterface) => {

//   //         this.accordion(this.employeeSkillsEnum.EDUCATION);
//   //         this.accordion(this.employeeSkillsEnum.WORK_EXPERIENCE);
//   //         this.accordion(this.employeeSkillsEnum.SKILLS_LANGUAGES);

//   //         const employeeInfo = data.robot_helper?.find(
//   //           (item: { link: string }) => item.link === "/employee/employee-info-2"
//   //         );
//   //         const employeeIsActive = data.robot_helper?.find(
//   //           (item: { link: string }) => item.link === "/employee/employee-info/isActive"
//   //         );

//   //         const employeeIsActiveIndex = data.robot_helper?.findIndex(
//   //           (item: { link: string }) => item.link === "/employee/employee-info/isActive"
//   //         ) ?? -1;

//   //         this._robotHelperService.setRobotSettings({
//   //           content: ["step1", "step2", "step3", "step4"],
//   //           navigationItemId: null,
//   //           isContentActive: true,
//   //         });

//   //         if (data?.robot_helper && employeeInfo && !employeeInfo?.hidden && employeeIsActiveIndex >= 0) {
//   //           this._robotHelperService.setRobotSettings({
//   //             content: ["step1", "step2", "step3", "step4"],
//   //             navigationItemId: null,
//   //             isContentActive: true,
//   //             uuid: employeeInfo.uuid,
//   //           });

//   //           this._robotHelperService.isRobotOpen$.next(true);
//   //           data.robot_helper[employeeIsActiveIndex].hidden = true;
//   //           this._localStorage.setItem("resume", JSON.stringify(data));
//   //           this._homeLayoutState.updateNavigationButtonsHandler();
//   //           return this._employeeFacade.updateCurrentPageRobot(data.robot_helper[employeeIsActiveIndex]["uuid"]);
//   //         }
//   //         return of(null);
//   //       })
//   //     ).subscribe();
//   // }

//   // localStorage get/set
//   private setValueToLocalStorage(): void {
//     this.employeeRegisterForm.valueChanges.subscribe((form) => {
//       const file = form.image;

//       if (file) {
//         const reader = new FileReader();
//         reader.onload = () => {
//           localStorage["file"] = reader.result;
//         };

//         reader.readAsDataURL(file);
//       }
//       localStorage.setItem("saveFormFieldDate", JSON.stringify(form));
//     });
//   }

//   private getValueFromLocalStorage(): void {
//     // @ts-ignore
//     this.formFieldDateFromLocaleStorage = JSON.parse(localStorage.getItem("saveFormFieldDate"));
//     if (this.formFieldDateFromLocaleStorage) {
//       const keys = Object.keys(this.formFieldDateFromLocaleStorage);
//       keys.forEach((keyItem, i) => {
//         this.addControlValue(keyItem, this.formFieldDateFromLocaleStorage, false);
//       });
//     }
//   }

//   // accordion
//   // private changeOverflow(): void {
//   //   setTimeout(() => {
//   //     this.hideOverflow.nativeElement.style.overflow = "inherit";
//   //   });
//   // }

//   // private changeOverflowForEducationContent(): void {
//   //   setTimeout(() => {
//   //     this.hideOverflowForEduContent.nativeElement.style.overflow = "inherit";
//   //   });
//   // }

//   // public accordion(state: string): void {
//   //   this.setDropdownLoader(state as EmployeeSkillsEnum, true);
//   //   let item = false;
//   //   this._employeeFacade.getAcardionActive$()
//   //     .subscribe(employee => {
//   //       item = employee[state];
//   //     });
//   //   const accordionNewState = {
//   //     [state]: !item
//   //   };
//   //   this._employeeFacade.setAccardionActive(accordionNewState);
//   //   this.accordionHeight(state, false);
//   // }

//   // private accordionHeight(name: string, item: boolean): void {
//   //   const offsetHeight = 500;
//   //   switch (name) {
//   //     case this.employeeSkillsEnum.WORK_EXPERIENCE :
//   //       this.workExperience.nativeElement.parentElement.style.overflowY = "hidden";
//   //       this.workExperience.nativeElement.parentElement.style.transition = `all 600ms ease-in-out`;

//   //       if (this.workExperience?.nativeElement.parentElement.offsetHeight === 0) {
//   //         this.workExperience.nativeElement.parentElement.style.maxHeight =
//   //           `${this.workExperience?.nativeElement.offsetHeight + offsetHeight}px`;
//   //         this.addWorkExperience(this.employeeSkillsEnum.WORK_EXPERIENCE, false);
//   //       } else if (item) {
//   //         this.workExperience.nativeElement.parentElement.style.maxHeight =
//   //           `${this.workExperience.nativeElement.parentElement.offsetHeight + offsetHeight}px`;
//   //       } else {
//   //         this.workExperience.nativeElement.parentElement.style.maxHeight = "0px";
//   //       }
//   //       break;
//   //     case this.employeeSkillsEnum.EDUCATION :
//   //       this.educationContent.nativeElement.parentElement.style.overflowY = "hidden";
//   //       this.educationContent.nativeElement.parentElement.style.transition = `all 600ms ease-in-out`;
//   //       if (this.educationContent?.nativeElement.parentElement.offsetHeight === 0) {
//   //         this.educationContent.nativeElement.parentElement.style.maxHeight = `${this.educationContent?.nativeElement.offsetHeight + offsetHeight}px`;
//   //         this.addEducation(this.employeeSkillsEnum.EDUCATION, false);
//   //       } else if (item) {
//   //         this.educationContent.nativeElement.parentElement.style.maxHeight =
//   //           `${this.educationContent.nativeElement.parentElement.offsetHeight + offsetHeight}px`;
//   //       } else {
//   //         this.educationContent.nativeElement.parentElement.style.maxHeight = "0px";
//   //       }
//   //       break;
//   //     case  this.employeeSkillsEnum.SKILLS_LANGUAGES:
//   //       this.skillsLanguage.nativeElement.parentElement.style.overflowY = "hidden";
//   //       this.educationContent.nativeElement.parentElement.style.transition = `all 600ms ease-in-out`;
//   //       if (this.skillsLanguage?.nativeElement.parentElement.offsetHeight === 0) {
//   //         this.skillsLanguage.nativeElement.parentElement.style.maxHeight = `${this.skillsLanguage?.nativeElement.offsetHeight + offsetHeight}px`;
//   //       } else {
//   //         this.skillsLanguage.nativeElement.parentElement.style.maxHeight = "0px";
//   //       }
//   //       break;
//   //     default:
//   //   }
//   //   this.setDropdownLoader(name as EmployeeSkillsEnum, false);
//   // }

//   // 3 forms
//   // public editSkillExperience(name: string, index: number): void {
//   //   switch (name) {
//   //     case this.employeeSkillsEnum.WORK_EXPERIENCE:
//   //       this.experienceItem = index;
//   //       this.editWorkExp = true;
//   //       this.changeOverflow();
//   //       break;
//   //     case this.employeeSkillsEnum.EDUCATION:
//   //       this.editEducation = true;
//   //       this.educationItem = index;
//   //       this.changeOverflowForEducationContent();
//   //       break;
//   //     default:
//   //   }
//   //   this.accordionHeight(name, true);
//   // }

//   // public addWorkExperience(
//   //   name: string,
//   //   addWork?: boolean): void {
//   //   this.experienceItem = 0;
//   //   if (this.editWorkExp && this.experienceItem) {
//   //     this.editWorkExp = false;
//   //     this.experienceItem = 0;
//   //     return;
//   //   }

//   //   const group = new FormGroup({
//   //     company: new FormControl(""),
//   //     position: new FormControl(""),
//   //     accept_date: new FormControl(""),
//   //     quit_date: new FormControl(""),
//   //     work_yet: new FormControl(false)
//   //   });
//   //   if (this.helperService.isObjectValue(this.experience.value) && addWork) {
//   //     this.experience.insert(0, group);
//   //     this.workExperienceAddedToCart = true;
//   //   }

//   //   this.experienceItem = 0;
//   //   if (addWork) {
//   //     this.accordionHeight(name, true);
//   //   }
//   // }

//   // public addEducation(name: string, addWork?: boolean, state?: EmployeeSkillsEnum): void {

//   //   if (this.editEducation && this.experienceItem) {
//   //     this.editEducation = false;
//   //     this.educationItem = 0;
//   //     return;
//   //   }

//   //   const group = new FormGroup({
//   //     education_id: new FormControl(""),
//   //     faculty: new FormControl(""),
//   //     graduate_date: new FormControl(""),
//   //     trainingFormat: new FormControl("")
//   //   });

//   //   if (this.helperService.isObjectValue(this.education.value) && addWork) {
//   //     this.education.insert(0, group);
//   //     this.educationAddedToCart = true;
//   //   }

//   //   this.educationItem = 0;
//   //   if (addWork) {
//   //     this.accordionHeight(name, true);
//   //   }
//   // }

//   // private specialistEducation(educations: any, firstTime: any): void {
//   //   educations.forEach((edu: any) => {

//   //     const form = this._formBuilder.group({
//   //       education_id: edu["education_id"],
//   //       graduate_date: edu["graduate_date"],
//   //       faculty: edu["faculty"],
//   //       trainingFormat: edu["trainingFormat"]
//   //     });

//   //     if (this.indexForEducation == 0 && !firstTime) {
//   //       this.education.removeAt(0);
//   //       this.education.push(form);
//   //       this.indexForEducation++;
//   //     } else {
//   //       localStorage.removeItem("saveFormFieldDate");
//   //       this.education.push(form);
//   //       if (this.education?.length === 1) {
//   //         this.educationItem = 0;
//   //       }
//   //     }
//   //   });
//   // }

//   // public specialistExperiences(experiences: any, firstTime: boolean): void {
//   //   experiences
//   //     .forEach((emp: any, i: number) => {
//   //       let form;
//   //       if (emp?.work_yet) {
//   //         form = this._formBuilder.group({
//   //           company: emp["company"],
//   //           position: emp["position"],
//   //           work_yet: emp["work_yet"]
//   //         });

//   //       } else if (emp["accept_date"] || emp["accept_date"]) {
//   //         form = this._formBuilder.group({
//   //           company: emp["company"],
//   //           position: emp["position"],
//   //           accept_date: emp["accept_date"],
//   //           quit_date: emp["quit_date"],
//   //         });
//   //       }

//   //       if (form) {
//   //         if (this.indexForExperience == 0 && !firstTime) {
//   //           this.experience.removeAt(0);
//   //           this.experience.push(form);
//   //           this.indexForExperience++;
//   //         } else {
//   //           localStorage.removeItem("saveFormFieldDate");
//   //           this.experience.push(form);
//   //           if (this.experience?.length === 1) {
//   //             this.experienceItem = 0;
//   //           }
//   //         }
//   //       }
//   //     });
//   // }

//   // public removeSkills(
//   //   controlName: FormControl,
//   //   deleteValue?: string,
//   //   fieldName?: string): void {

//   //   if (Array.isArray(controlName.value)) {
//   //     controlName.setValue(controlName.value.filter(val => {
//   //           return (val.displayName.toUpperCase() !== deleteValue?.toUpperCase());
//   //         }
//   //       )
//   //     );
//   //   } else {
//   //     controlName.setValue("");
//   //   }

//   //   this.programmingLangControl.updateValueAndValidity({emitEvent: true});
//   //   this.programmingFrameControl.updateValueAndValidity({emitEvent: true});

//   //   if (deleteValue && fieldName === ProgrammingLanguage.programmingLanguage) {
//   //     this.updateFrameworks(deleteValue, this.programmingFrameControl);
//   //   }
//   // }

//   // public selectAcceptDate(date: string, index: number): void {
//   //   this.specialistExperienceAcceptDate(index).setValue(date, {emitEvent: true});
//   // }

//   // public selectQuiteDate(date: string, index: number): void {
//   //   this.specialistExperienceQuitDate(index).setValue(date, {emitEvent: true});
//   // }

//   // public selectGraduateDate(date: string, index: number): void {
//   //   this.specialistGraduatedDate(index).setValue(date, {emitEvent: true});
//   // }

//   public setSelectedLanguagesUuids() {
//     delete this.searchParams.countryId;
//     const filteredData = this.allSelectedLanguages.filter(
//       (lang) =>
//         lang.displayName && this.programmingLangControl.value.indexOf(lang?.displayName) > -1
//     );
//     let ids: (string | number)[] = [];
//     if (filteredData) {
//       ids = filteredData.map((xx) => xx.id);
//     }
//     delete this.searchParams.countryId;
//     if (Boolean(ids?.length)) {
//       this.searchParams["programmingLanguageUuids"] = JSON.stringify([...ids]);
//     }
//   }

//   public removeWorkExperience(index: number, name: string): void {
//     switch (name) {
//       case this.employeeSkillsEnum.EDUCATION:
//         this.specialistForResume?.educations?.splice(index, 1);
//         // this.education.removeAt(index);
//         break;
//       case this.employeeSkillsEnum.WORK_EXPERIENCE:
//         this.specialistForResume?.experiences?.splice(index, 1);
//         // this.experience.removeAt(index);
//         break;
//       default:
//     }
//   }

//   public programmingLanguage(): void {
//     let parseValue;

//     if (this.specialistForResume?.languagesFrameworksForSelect) {
//       parseValue = JSON.parse(this.specialistForResume?.languagesFrameworksForSelect);
//     }

//     this.programmingFrameControl.setValue(parseValue["frameworks"]);
//     this.programmingLangControl.setValue(parseValue["languages"]);
//     this.selectFrameWorks();
//   }

//   public updateFrameworks(uncheckedLanguage: string, controlName: FormControl): void {
//     if (!this.startSearch.value) {
//       const progLanguages = this.programmingLangControl.value.filter(
//         (data: string) => data !== uncheckedLanguage
//       );
//       this._employeeFacade.setAllProgrammingFrameworksRequest$(progLanguages).subscribe(() => {
//         if (controlName?.value) {
//           const filteredFrameworks: string[] = [];
//           controlName?.value?.map((data: string) => {
//             if (Boolean(this.allSelectedFrameworks)) {
//               const framework = this.allSelectedFrameworks.filter((frame) => {
//                 return frame.displayName === data;
//               });

//               if (Boolean(framework.length) && framework[0].displayName) {
//                 filteredFrameworks.push(framework[0].displayName);
//               }
//             }
//           });
//           controlName.setValue(filteredFrameworks);
//           controlName.updateValueAndValidity({ emitEvent: true });
//           this.multiSelectedListProps$.next(filteredFrameworks);
//         }
//       });
//     }
//   }

//   public selectFrameWorks(): void {
//     // combineLatest([
//     //   this.programmingLangControl.valueChanges,
//     //   this.programmingFrameControl.valueChanges,
//     // ]).subscribe(([languagesList, frameworkList]) => {
//     //   const tmpArr: ObjectType[] = [];
//     //   if (!!languagesList?.length && !!frameworkList?.length) {
//     //     languagesList.forEach((language: LanguagesModel, index: number) => {
//     //       tmpArr.push({ [language.value]: [] });
//     //       frameworkList.forEach((frame: LanguagesModel) => {
//     //         if (language?.id === frame?.programmingLanguage?.uuid) {
//     //           tmpArr[index][language.value].push(frame.value);
//     //         }
//     //       });
//     //     });
//     //     this.languagesFrameworks = tmpArr;
//     //   }
//     // });
//   }

//   private programmingLanguageChange(): void {
//     this.programmingLangControl?.valueChanges
//       .pipe(
//         takeUntil(this.ngUnsubscribe),
//         switchMap((selectedProgrammingLanguages: SearchableSelectDataInterface[]) => {
//           if (selectedProgrammingLanguages && selectedProgrammingLanguages.length) {
//             const selectedLanguageIds = selectedProgrammingLanguages.map((language) => language.id);
//             let selectedFrameworks: SearchableSelectDataInterface[] | null =
//               this.programmingFrameControl.value;

//             if (selectedFrameworks) {
//               selectedFrameworks = selectedFrameworks.filter((framework) =>
//                 selectedLanguageIds.includes(framework.programmingLanguage?.uuid as StringOrNumber)
//               );
//             }

//             this.programmingFrameControl.setValue(selectedFrameworks);
//             return this._employeeFacade.addProgrammingFrameworks(
//               {
//                 programmingLanguageUuids: JSON.stringify([...selectedLanguageIds]),
//               },
//               true
//             );
//           }
//           if (selectedProgrammingLanguages && selectedProgrammingLanguages.length) {
//             this.selectedProgrammingLanguagesBackup = selectedProgrammingLanguages.map(
//               (language) => language.id
//             );
//             const uuIds = selectedProgrammingLanguages.map(
//               (selectedLanguage) => selectedLanguage.id
//             ) as string[];
//             return this._employeeFacade.addProgrammingFrameworks(
//               { programmingLanguageUuids: JSON.stringify([...uuIds]) },
//               true
//             );
//           } else {
//             this.programmingFrameControl.setValue(null);
//             return of([]);
//           }
//         })
//       )
//       .subscribe();
//   }

//   public disabledAddButton(): void {
//     //   combineLatest([
//     //     this.experience.valueChanges.pipe(startWith(null)),
//     //     this.education.valueChanges.pipe(startWith(null)),
//     //   ]).subscribe(([experience, education]) => {
//     //     if (experience && experience[0]?.work_yet) {
//     //       delete experience[0]?.quit_date;
//     //       delete experience[0]?.accept_date;
//     //       this.enableExperienceFormControl("work_yet");
//     //       this.disabledExperienceFormControl("quit_date");
//     //       this.disabledExperienceFormControl("accept_date");
//     //     } else {
//     //       this.enableExperienceFormControl("quit_date");
//     //       this.enableExperienceFormControl("accept_date");
//     //     }
//     //   if (
//     //     experience &&
//     //     (experience[0]?.quit_date?.length > 0 || experience[0]?.accept_date?.length > 0)
//     //   ) {
//     //     delete experience[0]?.work_yet;
//     //     this.enableExperienceFormControl("quit_date");
//     //     this.enableExperienceFormControl("accept_date");
//     //     this.disabledExperienceFormControl("work_yet");
//     //   }
//     //   if (experience) {
//     //     this.experienceDisabledBtn = this.checkControlValue(experience);
//     //   }
//     //   if (education) {
//     //     this.educationDisabledBtn = this.checkControlValue(education);
//     //   }
//     // });
//   }

//   // private disabledExperienceFormControl(controlName: string): void {
//   //   this.experience.controls[0]?.get(controlName)?.disable({ emitEvent: false });
//   // }

//   // private enableExperienceFormControl(controlName: string): void {
//   //   this.experience.controls[0]?.get(controlName)?.enable({ emitEvent: false });
//   // }

//   private addControlValue(
//     controlsKey: string,
//     employeeData: { [key: string]: any },
//     firstTime: boolean
//   ): void {
//     const patchValue = employeeData[controlsKey];
//     if (typeof employeeData[controlsKey] !== "object" || controlsKey == "languages") {
//       if (controlsKey === "gender") {
//         const newGender =
//           patchValue === SpecialistGenderTypeEnum.Male
//             ? SpecialistGenderEnum.Male
//             : SpecialistGenderEnum.Female;
//         // this.employeeGenderControl.setValue(newGender);
//       } else {
//         this.employeeRegisterForm.get(controlsKey)?.patchValue(patchValue);
//       }
//       this.employeeRegisterForm.updateValueAndValidity();
//     } else if (controlsKey === "experiences") {
//       // this.specialistExperiences(patchValue, firstTime);
//     } else if (controlsKey === "educations") {
//       // this.specialistEducation(patchValue, firstTime);
//     }
//     this.employeeRegisterForm.updateValueAndValidity();
//   }

//   private checkControlValue(form: []): boolean {
//     const disabled: boolean[] = [];
//     form.forEach((workExperience: string) => {
//       disabled.push(this.helperService.isObjectValue(workExperience));
//     });
//     return !disabled.every((arrayBollean) => Boolean(arrayBollean));
//   }
}
