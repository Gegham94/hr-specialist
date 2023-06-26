import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

import { FilterRecourseLocationCountries } from "src/app/modules/employee-info/interface/filter-resource-countryies.model";
import { FilterRecourseLocationCities } from "src/app/modules/employee-info/interface/filter-resource-list-city.model";
import { FilterRecourseUniversity } from "src/app/modules/employee-info/interface/filter-recource-university.model";
import {
  FilterRecourseProgrammingFrameworks,
  FilterRecourseProgrammingLanguages,
} from "src/app/modules/employee-info/interface/filter-recourse-programming-languages.mode";
import { IEmployee } from "src/app/root-modules/app/interfaces/employee.interface";

@Injectable({
  providedIn: "root",
})
export class EmployeeInfoState {
  public currentUserSubject$: BehaviorSubject<any> = new BehaviorSubject(null);
  private employeeUuid$: BehaviorSubject<string> = new BehaviorSubject("");
  private selectedContentReference$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private employee$: BehaviorSubject<any> = new BehaviorSubject(null);
  private accardion$ = new BehaviorSubject<any>({
    workExperience: false,
    education: false,
    skillsLanguages: false,
  });

  public setSelectedContentReference(ref: string) {
    this.selectedContentReference$.next(ref);
  }

  public getSelectedContentReference(): Observable<string> {
    return this.selectedContentReference$;
  }

  public getEmployee$(): Observable<IEmployee> {
    return this.employee$.asObservable();
  }

  public setEmployee(employee: IEmployee) {
    this.employee$.next(employee);
  }

  public getEmployeeUuid$(): Observable<string> {
    return this.employeeUuid$.asObservable();
  }

  public getAcardionActive$() {
    return this.accardion$.asObservable();
  }

  public setAccardionActive(state: any) {
    const currentValue = this.accardion$.getValue();
    this.accardion$.next({ ...currentValue, ...state });
  }

  public setEmployeeUuid(employeeUuid: string) {
    this.employeeUuid$.next(employeeUuid);
  }

  public removeEmployeeData() {
    this.currentUserSubject$.next(null);
  }

  private vacancyLocationCountries$: BehaviorSubject<FilterRecourseLocationCountries | null> =
    new BehaviorSubject<FilterRecourseLocationCountries | null>({ total: 0, data: [] });

  private vacancyLocationCities$: BehaviorSubject<FilterRecourseLocationCities> =
    new BehaviorSubject<FilterRecourseLocationCities>({ total: 0, data: [] });

  public setVacancyLocationCountries$(countries: FilterRecourseLocationCountries): void {
    if (!!countries?.data?.length) {
      this.vacancyLocationCountries$.next({
        total: countries.total,
        data: countries.data,
      });
    } else {
      this.vacancyLocationCountries$.next(null);
    }
  }

  public setVacancyLocationCities$(cities: FilterRecourseLocationCities) {
    if (!!cities?.data) {
      this.vacancyLocationCities$.next({
        total: cities.total,
        data: cities?.data,
      });
    } else {
      this.vacancyLocationCities$.next({});
    }
  }

  public resetVacancyLocationCities(): void {
    this.vacancyLocationCities$.next({ total: 0, data: [] });
  }

  public resetVacancyLocationCountries(): void {
    this.vacancyLocationCities$.next({ total: 0, data: [] });
  }

  public getVacancyLocationCities$(): Observable<FilterRecourseLocationCities> {
    return this.vacancyLocationCities$.asObservable();
  }

  public getVacancyLocationCountries$(): Observable<FilterRecourseLocationCountries | null> {
    return this.vacancyLocationCountries$.asObservable();
  }

  public get vacancyLocationCountriesSubject(): FilterRecourseLocationCountries | null {
    return this.vacancyLocationCountries$.value;
  }

  private vacancyProgrammingLanguages$: BehaviorSubject<FilterRecourseProgrammingLanguages> =
    new BehaviorSubject<FilterRecourseProgrammingLanguages>({ total: 0, data: [] });

  private vacancyProgrammingFrameworks$: BehaviorSubject<FilterRecourseProgrammingFrameworks> =
    new BehaviorSubject<FilterRecourseProgrammingFrameworks>({ total: 0, data: [] });

  private allProgrammingLanguages$: BehaviorSubject<FilterRecourseProgrammingLanguages> =
    new BehaviorSubject<FilterRecourseProgrammingLanguages>({ total: 0, data: [] });

  private allProgrammingFrameworks$: BehaviorSubject<FilterRecourseProgrammingFrameworks> =
    new BehaviorSubject<FilterRecourseProgrammingFrameworks>({ total: 0, data: [] });

  private vacancyLocationUniversities$: BehaviorSubject<FilterRecourseUniversity> =
    new BehaviorSubject<FilterRecourseUniversity>({ total: 0, data: [] });

  public get vacancyProgrammingLanguagesSubject(): FilterRecourseProgrammingLanguages {
    return this.vacancyProgrammingLanguages$.value;
  }

  public get vacancyProgrammingFrameworksSubject(): FilterRecourseProgrammingFrameworks {
    return this.vacancyProgrammingFrameworks$.value;
  }

  public setVacancyProgrammingLanguages(
    languages: FilterRecourseProgrammingLanguages,
    reset: boolean
  ) {
    if (!!languages?.data?.length) {
      return this.vacancyProgrammingLanguages$.next({
        total: languages.total,
        data: reset
          ? languages.data
          : this.vacancyProgrammingLanguages$.value?.data?.concat(languages.data),
      });
    }
  }

  public setAllProgrammingLanguages(languages: FilterRecourseProgrammingLanguages) {
    if (!!languages?.data?.length) {
      return this.allProgrammingLanguages$.next({
        total: languages.total,
        data: languages.data,
      });
    }
  }

  public getVacancyProgrammingLanguages() {
    return this.vacancyProgrammingLanguages$.asObservable();
  }

  public setVacancyProgrammingFrameworks(
    frameworks: FilterRecourseProgrammingFrameworks,
    reset: boolean
  ) {
    if (!!frameworks?.data?.length) {
      return this.vacancyProgrammingFrameworks$.next({
        total: frameworks.total,
        data: reset
          ? frameworks.data
          : this.vacancyProgrammingFrameworks$.value?.data?.concat(frameworks.data),
      });
    }
  }

  public setAllProgrammingFrameworks(frameworks: FilterRecourseProgrammingFrameworks) {
    return this.allProgrammingFrameworks$.next({
      total: frameworks?.total,
      data: frameworks?.data,
    });
  }

  public getVacancyProgrammingFrameworks() {
    return this.vacancyProgrammingFrameworks$.asObservable();
  }

  public getAllProgrammingFrameworks() {
    return this.allProgrammingFrameworks$.asObservable();
  }

  public getAllProgrammingLanguages() {
    return this.allProgrammingLanguages$.asObservable();
  }

  public getVacancyLocationUniversities$(): Observable<FilterRecourseUniversity> {
    return this.vacancyLocationUniversities$.asObservable();
  }

  public resetVacancyProgrammingFrameworksState(data = { total: 0, data: [] }) {
    this.vacancyProgrammingFrameworks$.next(data);
  }

  public setVacancyLocationUniversities$(universities: FilterRecourseUniversity) {
    if (!!universities?.data?.length) {
      return this.vacancyLocationUniversities$.next({
        total: universities.total,
        data: universities.data,
      });
    }
  }
}
