import { Injectable } from "@angular/core";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { BehaviorSubject, Observable, catchError, combineLatest, map, of, switchMap } from "rxjs";
import { Education, Experiences, ProfileInfo, Skills, UserConstructedData } from "../interfaces/profile-form.interface";
import { IEmployee } from "src/app/shared/interfaces/employee.interface";

@Injectable({
  providedIn: "root",
})
export class ResumeStateService {
  public editModeActive$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public constructedData$: BehaviorSubject<UserConstructedData | null> =
    new BehaviorSubject<UserConstructedData | null>(null);

  constructor(private readonly indexedDb: NgxIndexedDBService) {}

  public checkForResumeInDb(): Observable<boolean> {
    return this.indexedDb.getAll("resume").pipe(
      map((storeData) => (storeData.length ? true : false)),
      catchError((err) => of(false))
    );
  }

  public setResumeInDb(resume: IEmployee): Observable<IEmployee> {
    return this.indexedDb.update("resume", resume);
  }

  public clearAllStores(): Observable<boolean[]> {
    return combineLatest([
      this.indexedDb.clear("forms"),
      this.indexedDb.clear("resume"),
      this.indexedDb.clear("settings"),
    ]);
  }

  public createResumeFormSections(resume: IEmployee): Observable<ProfileInfo | null> {
    const userInfo = new ProfileInfo(resume)
      .setSalaryAndCurrency(resume.salary)
      .setDateOfBirth(resume.dateOfBirth)
      .setGenderValue(resume.gender);
    const userEducation = new Education(resume);
    const userExperience = new Experiences(resume);
    const userSkills = new Skills(resume);
    this.constructedData$.next({
      userInfo,
      userEducation,
      userExperience,
      userSkills,
    });

    this.editModeActive$.next(!!userInfo.name);

    return this.initAllFormGroups(userInfo, userEducation, userExperience, userSkills, !!userInfo.name);
  }

  public updateAllFormGroups(
    info: ProfileInfo,
    education: Education,
    experience: Experiences,
    skills: Skills
  ): Observable<null> {
    return combineLatest([
      this.updateUserInfo(info),
      this.updateUserEducation(education),
      this.updateUserExperience(experience),
      this.updateUserSkills(skills),
    ]).pipe(map(() => null));
  }

  public getUserInfoForm(): Observable<ProfileInfo> {
    return this.indexedDb.getByIndex("forms", "id", 1);
  }

  public getUserEducationForm(): Observable<Education> {
    return this.indexedDb.getByIndex("forms", "id", 2);
  }

  public getUserExperiencesForm(): Observable<Experiences> {
    return this.indexedDb.getByIndex("forms", "id", 3);
  }

  public getUserSkillsForm(): Observable<Skills> {
    return this.indexedDb.getByIndex("forms", "id", 4);
  }

  private initAllFormGroups(
    info: ProfileInfo,
    education: Education,
    experience: Experiences,
    skills: Skills,
    resetDb: boolean = false
  ): Observable<null> {
    if (!resetDb) {
      return combineLatest([
        this.initUserInfo(info),
        this.initUserEducation(education),
        this.initUserExperience(experience),
        this.initUserSkills(skills),
      ]).pipe(map(() => null));
    }
    return this.indexedDb.clear("forms").pipe(
      switchMap(() => {
        return combineLatest([
          this.initUserInfo(info),
          this.initUserEducation(education),
          this.initUserExperience(experience),
          this.initUserSkills(skills),
        ]).pipe(map(() => null));
      })
    );
  }

  private initUserInfo(infoForm: ProfileInfo): Observable<ProfileInfo | null> {
    return this.indexedDb.getByIndex("forms", "id", 1).pipe(
      switchMap((res) => {
        if (res) {
          return of(null);
        } else {
          return this.indexedDb.add("forms", infoForm);
        }
      })
    );
  }

  private initUserEducation(education: Education): Observable<Education | null> {
    return this.indexedDb.getByIndex("forms", "id", 2).pipe(
      switchMap((res) => {
        if (res) {
          return of(null);
        } else {
          return this.indexedDb.add("forms", education);
        }
      })
    );
  }

  private initUserExperience(experiences: Experiences): Observable<Experiences | null> {
    return this.indexedDb.getByIndex("forms", "id", 3).pipe(
      switchMap((res) => {
        if (res) {
          return of(null);
        } else {
          return this.indexedDb.add("forms", experiences);
        }
      })
    );
  }

  private initUserSkills(skills: Skills): Observable<Skills | null> {
    return this.indexedDb.getByIndex("forms", "id", 4).pipe(
      switchMap((res) => {
        if (res) {
          return of(null);
        } else {
          return this.indexedDb.add("forms", skills);
        }
      })
    );
  }

  private updateUserInfo(userInfo: ProfileInfo): Observable<ProfileInfo> {
    return this.indexedDb.update("forms", userInfo);
  }

  private updateUserEducation(userEducation: Education): Observable<Education> {
    return this.indexedDb.update("forms", userEducation);
  }

  private updateUserExperience(userExperience: Experiences): Observable<Experiences> {
    return this.indexedDb.update("forms", userExperience);
  }

  private updateUserSkills(userSkills: Skills): Observable<Skills> {
    return this.indexedDb.update("forms", userSkills);
  }
}
