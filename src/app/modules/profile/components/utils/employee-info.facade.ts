import {Injectable} from "@angular/core";

import {IEmployee} from "../../../../root-modules/app/interfaces/employee.interface";
import {EmployeeInfoService} from "./employee-info.service";
import {
  distinctUntilChanged,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from "rxjs";
import {EmployeeInfoState} from "./employee-info.state";
import {FilterRecourseLocationCountries} from "../../../employee-info/interface/filter-resource-countryies.model";
import {SearchableSelectDataInterface} from "../../../../root-modules/app/interfaces/searchable-select-data.interface";
import {ObjectType} from "../../../../shared-modules/types/object.type";
import {FilterRecourseLocationCities} from "../../../employee-info/interface/filter-resource-list-city.model";
import {
  FilterRecourseProgrammingFrameworks,
  FilterRecourseProgrammingLanguages,
} from "../../../employee-info/interface/filter-recourse-programming-languages.mode";
import {FilterRecourseUniversity} from "../../../employee-info/interface/filter-recource-university.model";
import {SearchParams} from "../../../employee-info/interface/search-params";
import {LocalStorageService} from "../../../../root-modules/app/services/local-storage.service";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { ResumeStateService } from "./resume-state.service";

@Injectable({
  providedIn: "root",
})
export class EmployeeInfoFacade {
  constructor(
    private readonly _localStorage: LocalStorageService,
    private readonly _employeeService: EmployeeInfoService,
    private readonly _employeeState: EmployeeInfoState,
    private readonly _indexedDbService: NgxIndexedDBService,
    private readonly _resumeState: ResumeStateService

  ) {
  }

  public getEmployeeUuid$(): Observable<string> {
    return this._employeeState.getEmployeeUuid$();
  }

  public getAcardionActive$() {
    return this._employeeState.getAcardionActive$();
  }

  public setAccardionActive(state: any) {
    return this._employeeState.setAccardionActive(state);
  }

  public setEmployeeUuid(employeeUuid: string): void {
    this._employeeState.setEmployeeUuid(employeeUuid);
  }

  public getEmployee$(): Observable<IEmployee> {
    return this._employeeState.getEmployee$();
  }

  public setEmployee(employee: IEmployee): void {
    this._employeeState.setEmployee(employee);
  }

  public removeEmployeeData(): void {
    this._employeeState.removeEmployeeData();
  }

  public saveResume(employee: any): Observable<IEmployee> {
    return this._employeeService.saveResume(employee).pipe(
      switchMap(() => {
        return this.getResume();
      })
    );
  }

  public getResume(): Observable<IEmployee> {
    return this._employeeService.getResume().pipe(
      map((res) => {
        this._localStorage.setItem("resume", JSON.stringify(res));
        this._employeeState.setEmployee(res);
        return res;
      }),
      switchMap(resume => this._resumeState.checkForResumeInDb().pipe(
        switchMap(dbExists => {
          if (dbExists) {
            return of(resume);
          } else {
            return this._resumeState.setResumeInDb(resume).pipe(map(res => resume));
          }
        })
      ))
    );
  }

  public setSelectedContentReference(ref: string) {
    this._employeeState.setSelectedContentReference(ref);
  }

  public getSelectedContentReference(): Observable<string> {
    return this._employeeState.getSelectedContentReference();
  }

  public getEmploymentTypes$(): Observable<SearchableSelectDataInterface[]> {
    return this._employeeService.getEmploymentTypes$();
  }

  public getVacancyLocationCountriesRequest$(): Observable<SearchableSelectDataInterface[] | null> {
    return this._employeeState.getVacancyLocationCountries$().pipe(
      map((data: FilterRecourseLocationCountries | null) => {
        if (data) {
          let countries: SearchableSelectDataInterface[] = [];
          data?.data?.map((item: ObjectType) => {
            for (const key in item) {
              if (item.hasOwnProperty(key)) {
                countries.push({
                  id: key,
                  value: item[key],
                  displayName: item[key],
                  count: data["total"],
                });
              }
            }
          });
          countries = countries.sort((countryA, countryB) => {
            return countryA.displayName.toLowerCase() < countryB.displayName.toLowerCase()
              ? -1
              : countryA.displayName.toLowerCase() > countryB.displayName.toLowerCase()
              ? 1
              : 0;
          });
          return countries;
        }
        return null;
      })
    );
  }

  public getVacancyLocationCitiesRequest$(): Observable<SearchableSelectDataInterface[] | null> {
    return this._employeeState.getVacancyLocationCities$().pipe(
      map((item: FilterRecourseLocationCities) => {
        if (item) {
          let cities: SearchableSelectDataInterface[] = [];
          for (const city in item.data) {
            if (city) {
              cities.push({
                id: city,
                value: item.data[city],
                displayName: item.data[city],
                count: item["total"],
              });
            }
          }
          cities = cities.sort((cityA, cityB) => {
            return cityA.displayName.toLowerCase() < cityB.displayName.toLowerCase()
              ? -1
              : cityA.displayName.toLowerCase() > cityB.displayName.toLowerCase()
              ? 1
              : 0;
          });
          return cities;
        }
        return null;
      })
    );
  }

  public setLocationCitiesRequest$(
    searchParams: SearchParams,
  ): Observable<FilterRecourseLocationCities> {
    return this._employeeService.getFilterRecourseLocationCitiesRequest$(searchParams).pipe(
      distinctUntilChanged(),
      tap((res: FilterRecourseLocationCities) => {
        this._employeeState.setVacancyLocationCities$(res);
      })
    );
  }

  public get vacancyLocationCountriesSubject(): FilterRecourseLocationCountries | null {
    return this._employeeState.vacancyLocationCountriesSubject;
  }

  public getLanguages$(): Observable<SearchableSelectDataInterface[]> {
    return this._employeeService.getLanguages$();
  }

  public getCitiesByCountry(searchParams: SearchParams, country: string): Observable<FilterRecourseLocationCities | null> {
    const countries = this.vacancyLocationCountriesSubject;
    let result: Observable<FilterRecourseLocationCities | null> = of(null);
    countries?.data?.forEach((item: FilterRecourseLocationCountries) => {
      for (const key in item) {
        if (item.hasOwnProperty(key) && item[key] === country) {
          searchParams["countryId"] = key;
          result = this.setLocationCitiesRequest$(searchParams);
        }
      }
    });
    return result;
  }

  public setLocationCountriesRequest$(): Observable<void> {
    return this._employeeService.getFilterRecourseLocationCountriesRequest().pipe(
      map((res: FilterRecourseLocationCountries) => {
        if (res.data) {
          this._employeeState.setVacancyLocationCountries$(res);
        }
      })
    );
  }

  public resetVacancyLocationCountries(): void {
    this._employeeState.resetVacancyLocationCountries();
  }

  public setProgrammingLanguagesRequest$(
    searchParams: SearchParams,
    reset: boolean
  ): Observable<FilterRecourseProgrammingLanguages> {
    return this._employeeService.getFilterRecourseProgrammingLanguagesRequest$(searchParams).pipe(
      tap((res: FilterRecourseProgrammingLanguages) => {
        if (res.data) {
          this._employeeState.setVacancyProgrammingLanguages(res, reset);
        }
      })
    );
  }

  public setAllProgrammingLanguagesRequest$(): Observable<FilterRecourseProgrammingLanguages> {
    return this._employeeService.getFilterRecourseProgrammingLanguagesRequest$({}).pipe(
      tap((res: FilterRecourseProgrammingLanguages) => {
        if (res.data) {
          this._employeeState.setAllProgrammingLanguages(res);
        }
      })
    );
  }

  public getAllProgrammingLanguages(): Observable<SearchableSelectDataInterface[]> {
    return this._employeeState.getAllProgrammingLanguages().pipe(
      map((data: FilterRecourseProgrammingLanguages) => {
        let languages: SearchableSelectDataInterface[] = [];
        data?.data?.map((item) => {
          languages.push({
            id: item.uuid,
            value: item.joinedName,
            displayName: item.defaultName,
            count: data["total"],
          } as SearchableSelectDataInterface);
        });
        languages = languages.sort((languageA, languageB) => {
          return languageA.displayName.toLowerCase() < languageB.displayName.toLowerCase()
            ? -1
            : languageA.displayName.toLowerCase() > languageB.displayName.toLowerCase()
            ? 1
            : 0;
        });
        return languages;
      })
    );
  }

  // public getAllProgrammingFrameworks(): Observable<SearchableSelectDataInterface[]> {
  //   return this._employeeState.getAllProgrammingFrameworks().pipe(
  //     map((data: FilterRecourseProgrammingFrameworks) => {
  //       let frameworks: SearchableSelectDataInterface[] = [];
  //       data?.data?.map((item) => {
  //         frameworks.push({
  //           id: item.uuid,
  //           value: item.joinedName,
  //           displayName: item.defaultName,
  //           programmingLanguage: item.programming_language,
  //         } as SearchableSelectDataInterface);
  //       });
  //       frameworks = frameworks.sort((frameworkA, frameworkB) => {
  //         return frameworkA.displayName.toLowerCase() <
  //         frameworkB.displayName.toLowerCase()
  //           ? -1
  //           : frameworkA.displayName.toLowerCase() >
  //           frameworkB.displayName.toLowerCase()
  //             ? 1
  //             : 0;
  //       });
  //       return frameworks;
  //     })
  //   );
  // }

  public setProgrammingFrameworksRequest$(
    searchParams: SearchParams,
    reset: boolean
  ): Observable<FilterRecourseProgrammingFrameworks> {
    return this._employeeService.getFilterRecourseProgrammingFrameworksRequest$(searchParams).pipe(
      tap((res: FilterRecourseProgrammingFrameworks) => {
        if (res.data) {
          this._employeeState.setVacancyProgrammingFrameworks(res, reset);
        }
      })
    );
  }

  public setAllProgrammingFrameworksRequest$(
    data: string[],
    searchParams: ObjectType = {}
  ): Observable<FilterRecourseProgrammingFrameworks> {
    searchParams = {};
    const filteredData = this.getVacancyProgrammingLanguagesSubject()?.data?.filter(
      (lang) => lang.defaultName && data.indexOf(lang?.defaultName) > -1
    );
    let ids: (string | undefined)[] = [];
    if (filteredData) {
      ids = filteredData.map((xx) => xx.uuid);
    }
    if (!!ids.length) {
      searchParams["programmingLanguageUuids"] = JSON.stringify(ids);
    } else {
      this._employeeState.setAllProgrammingFrameworks({ total: 0, data: [] });
      return of({ total: 0, data: [] });
    }

    return this._employeeService.getFilterRecourseProgrammingFrameworksRequest$(searchParams).pipe(
      tap((res: FilterRecourseProgrammingFrameworks) => {
        if (res.data) {
          this._employeeState.setAllProgrammingFrameworks(res);
        }
      })
    );
  }

  public addProgrammingFrameworks(
    searchParams: SearchParams,
    reset: boolean
  ): Observable<FilterRecourseProgrammingFrameworks> {
    return this.setProgrammingFrameworksRequest$(searchParams, reset);
  }

  public getProgrammingLanguagesRequest$(): Observable<SearchableSelectDataInterface[]> {
    return this._employeeState.getVacancyProgrammingLanguages().pipe(
      map((data: FilterRecourseProgrammingLanguages) => {
        const languages: SearchableSelectDataInterface[] = [];
        data?.data?.map((item) => {
          languages.push({
            id: item.uuid,
            value: item.joinedName,
            displayName: item.defaultName,
            count: data["total"],
          } as SearchableSelectDataInterface);
        });
        return languages;
      })
    );
  }

  public getProgrammingFrameworksRequest$(): Observable<SearchableSelectDataInterface[] | null> {
    return this._employeeState.getVacancyProgrammingFrameworks().pipe(
      map((data: FilterRecourseProgrammingFrameworks) => {
        let frameworks: SearchableSelectDataInterface[] = [];
        data?.data?.map((item) => {
          frameworks.push({
            id: item.uuid,
            value: item.joinedName,
            displayName: item.defaultName,
            count: data.total,
            programmingLanguage: item.programming_language,
          } as SearchableSelectDataInterface);
        });
        frameworks = frameworks.sort((frameworkA, frameworkB) => {
          return frameworkA.displayName.toLowerCase() < frameworkB.displayName.toLowerCase()
            ? -1
            : frameworkA.displayName.toLowerCase() > frameworkB.displayName.toLowerCase()
            ? 1
            : 0;
        });
        return frameworks.length ? frameworks : null;
      })
    );
  }

  public getUniversityRequest$(): Observable<SearchableSelectDataInterface[]> {
    return this._employeeState.getVacancyLocationUniversities$().pipe(
      map((data: FilterRecourseUniversity) => {
        let universities: SearchableSelectDataInterface[] = [];
        data?.data?.map((item) => {
          universities.push({
            id: item.uuid,
            value: item.name,
            displayName: item?.name?.toUpperCase(),
            count: data["total"],
          } as SearchableSelectDataInterface);
        });
        universities = universities.sort((universityA, universityB) => {
          return universityA.displayName.toLowerCase() < universityB.displayName.toLowerCase()
            ? -1
            : universityA.displayName.toLowerCase() > universityB.displayName.toLowerCase()
            ? 1
            : 0;
        });
        return universities;
      })
    );
  }

  public getVacancyProgrammingLanguagesSubject(): FilterRecourseProgrammingLanguages {
    return this._employeeState.vacancyProgrammingLanguagesSubject;
  }

  public getVacancyProgrammingFrameworksSubject(): FilterRecourseProgrammingFrameworks {
    return this._employeeState.vacancyProgrammingFrameworksSubject;
  }

  public resetProgrammingFrameworks(data = { total: 0, data: [] }): void {
    this._employeeState.resetVacancyProgrammingFrameworksState(data);
  }

  public setUniversitiesRequest$(): Observable<FilterRecourseUniversity> {
    return this._employeeService.getFilterRecourseUniversityRequest$().pipe(
      tap((res) => {
        this._employeeState.setVacancyLocationUniversities$(res);
      })
    );
  }

  public updateCurrentPageRobot(uuid: string): Observable<ObjectType> {
    return this._employeeService.updateCurrentPageRobot(uuid);
  }
}
