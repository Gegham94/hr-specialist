import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Injectable } from "@angular/core";

import { combineLatest, map, Observable, Subject, tap } from "rxjs";
import {
  Education,
  Experiences,
  IEducation,
  IEducationItem,
  IExperiences,
  IProfileInfo,
  IUserSkills,
  ProfileInfo,
  Skills,
  IWorkExperience,
} from "../../../interfaces/profile-form.interface";
import { LocalStorageService } from "src/app/shared/services/local-storage.service";
import { PatternModelEnum } from "src/app/modules/auth/enum/pattern.model";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { SpecialistGenderEnum, SpecialistGenderTypeEnum } from "../../../enums/specialist-gender.enum";
import { ObjectType } from "../../../../../shared/types/object.type";
import { ResumeStateService } from "../../../services/resume-state.service";

@Injectable({
  providedIn: "root",
})
export class ProfileFormControlService {
  private regexpForName = PatternModelEnum.patternForName;
  public savedExperiences: IWorkExperience[] = [];
  public savedEducation: IEducationItem[] = [];

  public savedExperienceChange$: Subject<void> = new Subject<void>();
  public savedEducationChange$: Subject<void> = new Subject<void>();
  public infoChange$: Subject<void> = new Subject<void>();
  public skillsChange$: Subject<void> = new Subject<void>();

  public skillsForm: FormGroup = this.fb.group({
    id: [4],
    programmingLanguages: [[], Validators.required],
    programmingFrameworks: [[], Validators.required],
    languages: [[]],
  });

  public infoForm: FormGroup = this.fb.group({
    id: [1],
    name: ["", [Validators.required, Validators.pattern(this.regexpForName)]],
    surname: ["", [Validators.required, Validators.pattern(this.regexpForName)]],
    image: ["", [Validators.required]],
    phone: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(12)]],
    email: ["", [Validators.required, Validators.email, Validators.pattern(/^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
    country: [[], Validators.required],
    city: [[], Validators.required],
    dateOfBirth: ["", Validators.required],
    gender: ["", Validators.required],
    citizenship: ["", Validators.required],
    employment: ["", Validators.required],
    position: ["", Validators.required],
    salary: ["", Validators.required],
    currency: ["RUB", Validators.required],
  });

  public experienceForm: FormGroup = this.fb.group({
    id: [null],
    accept_date: ["", [Validators.required]],
    company: ["", [Validators.required]],
    position: ["", [Validators.required]],
    quit_date: ["", [Validators.required]],
    stillWorking: ["", [Validators.required]],
    hasNoExperience: [null],
  });

  public educationForm: FormGroup = this.fb.group({
    id: [null],
    education_id: ["", [Validators.required]],
    faculty: ["", [Validators.required]],
    graduate_date: ["", [Validators.required]],
    trainingFormat: ["", [Validators.required]],
    hasNoEducation: [null],
  });

  constructor(
    private localStorageService: LocalStorageService,
    private dbService: NgxIndexedDBService,
    private resumeStateService: ResumeStateService,
    private fb: FormBuilder
  ) {}

  // Info form
  public initInfoForm(): Observable<null | ProfileInfo> {
    return this.resumeStateService.getUserInfoForm().pipe(
      map((res) => {
        this.infoForm.patchValue(res);
        return res;
      })
    );
  }

  public storeInfoForm(infoForm: IProfileInfo): Observable<IProfileInfo> {
    return this.dbService.update("forms", infoForm).pipe(
      tap(() => {
        this.infoChange$.next();
      })
    );
  }

  // Education form
  public initEducationForm(): Observable<null | Education> {
    return this.resumeStateService.getUserEducationForm().pipe(
      map((res) => {
        this.educationForm.patchValue(res.form);
        this.savedEducation.push(...res.savedEducation);
        return res;
      })
    );
  }

  public storeEducationForm(education: IEducation): Observable<IEducation> {
    return this.dbService.update("forms", education).pipe(
      tap(() => {
        this.savedEducationChange$.next();
      })
    );
  }

  public getEducationById(id: number): Observable<IEducation> {
    return (this.dbService.getByIndex("forms", "id", 2) as Observable<IEducation>).pipe(
      tap((storedEducation) => {
        if (storedEducation) {
          const education = storedEducation.savedEducation.find((item) => item.id === id);
          if (education) {
            this.educationForm.patchValue(education);
          }
          this.educationForm.updateValueAndValidity({ emitEvent: true });
        }
      })
    );
  }

  // Experience form
  public initExperienceForm(): Observable<null | Experiences> {
    return this.resumeStateService.getUserExperiencesForm().pipe(
      map((res) => {
        this.experienceForm.patchValue(res.form);
        this.savedExperiences.push(...res.savedExperiences);
        return res;
      })
    );
  }

  public storeExperienceForm(experiences: IExperiences): Observable<IExperiences> {
    return this.dbService.update("forms", experiences).pipe(
      tap(() => {
        this.savedExperienceChange$.next();
      })
    );
  }

  public getExperienceById(id: number): Observable<IExperiences> {
    return (this.dbService.getByIndex("forms", "id", 3) as Observable<IExperiences>).pipe(
      tap((storedExperience) => {
        if (storedExperience) {
          const exp = storedExperience.savedExperiences.find((item) => item.id === id);
          if (exp) {
            this.experienceForm.patchValue(exp);
          }
          this.experienceForm.updateValueAndValidity({ emitEvent: true });
        }
      })
    );
  }

  // Skills form
  public storeSkillsForm(skills: IUserSkills): Observable<IUserSkills> {
    return this.dbService.update("forms", skills).pipe(
      tap(() => {
        this.skillsChange$.next();
      })
    );
  }

  public initSkillsForm(): Observable<null | Skills> {
    return this.resumeStateService.getUserSkillsForm().pipe(
      map((res) => {
        this.skillsForm.patchValue(res);
        return res;
      })
    );
  }

  public getDbProfileDataForSend() {
    return combineLatest([
      this.dbService.getByIndex("forms", "id", 1) as Observable<IProfileInfo>,
      this.dbService.getByIndex("forms", "id", 2) as Observable<IEducation>,
      this.dbService.getByIndex("forms", "id", 3) as Observable<IExperiences>,
      this.dbService.getByIndex("forms", "id", 4) as Observable<IUserSkills>,
      this.localStorageService.resume$,
    ]).pipe(
      map(([profile, educations, experiences, skills, resume]) => {
        const languagesAndFrames = JSON.parse(JSON.stringify(skills.programmingFrameworks)).reduce(
          (group: ObjectType, framework: ObjectType) => {
            const { programmingLanguage } = framework;
            if (programmingLanguage) {
              group[programmingLanguage.joinedName] = group[programmingLanguage.joinedName] ?? [];
              group[programmingLanguage.joinedName].push(framework["displayName"]);
            }
            return group;
          },
          {}
        );

        if (profile.currency && profile.salary) {
          profile.salary = `${profile.salary[0]["displayName"] ? profile.salary[0]["displayName"] : profile.salary}/${
            profile.currency[0]["displayName"] ? profile.currency[0]["displayName"] : profile.currency
          }`;
        }

        profile.gender =
          profile.gender[0]["displayName"] === SpecialistGenderEnum.Male
            ? SpecialistGenderTypeEnum.Male
            : SpecialistGenderTypeEnum.Female;

        profile.employee_uuid = resume?.uuid;

        profile.citizenship = profile.citizenship[0]["displayName"]
          ? profile.citizenship[0]["displayName"]
          : profile.citizenship;

        profile.city = profile.city[0]["displayName"] ? profile.city[0]["displayName"] : profile.city;

        profile.country = profile.country[0]["displayName"] ? profile.country[0]["displayName"] : profile.country;

        profile.employment = profile.employment[0]["value"] ? profile.employment[0]["value"] : profile.employment;

        profile.position = profile.position[0]["displayName"] ? profile.position[0]["displayName"] : profile.position;

        skills.languages = JSON.stringify(skills.languages === "" ? [] : skills.languages);

        skills.languagesFrameworks = JSON.stringify([languagesAndFrames]);

        skills.languagesFrameworksForSelect = JSON.stringify({
          languages: skills.programmingLanguages,
          frameworks: skills.programmingFrameworks,
        });

        const formattedEducations = educations.savedEducation.map((s) => {
          return {
            education_id: typeof s.education_id !== "string" ? s.education_id[0].displayName : s.education_id,
            graduate_date: s.graduate_date,
            faculty: typeof s.faculty !== "string" ? s.faculty[0].displayName : s.faculty,
            trainingFormat: typeof s.trainingFormat !== "string" ? s.trainingFormat[0].displayName : s.trainingFormat,
          };
        });

        const formattedExperience = experiences.savedExperiences.map((experience) => {
          if (experience.stillWorking) {
            return {
              company: experience.company,
              position: experience.position,
              accept_date: experience.accept_date,
              stillWorking: experience.stillWorking,
            };
          } else {
            return {
              company: experience.company,
              position: experience.position,
              accept_date: experience.accept_date,
              quit_date: experience.quit_date,
            };
          }
        });

        return {
          ...profile,
          ...{ educations: JSON.stringify(formattedEducations) },
          ...{ experiences: JSON.stringify(formattedExperience) },
          ...skills,
        };
      })
    );
  }
}
