import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, of } from "rxjs";

import { FilterRecourseLocationCountries } from "src/app/modules/employee-info/interface/filter-resource-countryies.model";
import { FilterRecourseLocationCities } from "src/app/modules/employee-info/interface/filter-resource-list-city.model";
import { SearchableSelectDataInterface } from "src/app/root-modules/app/interfaces/searchable-select-data.interface";
import { FilterRecourseUniversity } from "src/app/modules/employee-info/interface/filter-recource-university.model";
import {
  FilterRecourseProgrammingFrameworks,
  FilterRecourseProgrammingLanguages,
} from "src/app/modules/employee-info/interface/filter-recourse-programming-languages.mode";
import { IEmployee } from "src/app/root-modules/app/interfaces/employee.interface";
import { languages } from "src/app/modules/employee-info/mock/specialist-mock";
import { ObjectType } from "src/app/shared-modules/types/object.type";
import { environment } from "src/environments/environment";
import { employmentTypes } from "../../../../shared/constants/employment-type.enum";

@Injectable({
  providedIn: "root",
})
export class EmployeeInfoService {
  private readonly employeeResume = "specialist/resume";
  private readonly formFieldForCountry = "filter-resource/location/countries";
  private readonly formFieldForCity = "filter-resource/location/cities";
  private readonly programmingLanguages = "filter-resource/programming/languages";
  private readonly languagesFrameworks = "filter-resource/programming/frameworks";
  private readonly university = "filter-resource/university";
  private readonly robot_helper = "specialist/change-robot-helper-hidden";

  constructor(private readonly _http: HttpClient) {}

  public getEmploymentTypes$(): Observable<SearchableSelectDataInterface[]> {
    return of(employmentTypes);
  }

  public saveResume(userData: IEmployee): Observable<IEmployee> {
    const fullUrl = `${environment.url}/${this.employeeResume}`;
    return this._http.post<IEmployee>(fullUrl, userData);
  }

  public getResume(): Observable<IEmployee> {
    const fullUrl = `${environment.url}/${this.employeeResume}`;
    return this._http.get<{ data: IEmployee }>(fullUrl).pipe(map((response) => response.data));
  }

  public getFilterRecourseLocationCountriesRequest(): Observable<FilterRecourseLocationCountries> {
    const fullUrl = `${environment.filterRecourseUrl}/${this.formFieldForCountry}`;
    return this._http.get<FilterRecourseLocationCountries>(fullUrl);
  }

  public getFilterRecourseLocationCitiesRequest$(searchParams: ObjectType): Observable<FilterRecourseLocationCities> {
    return this._http.get<FilterRecourseLocationCities>(`${environment.filterRecourseUrl}/${this.formFieldForCity}`, {
      params: searchParams,
    });
  }

  public getFilterRecourseProgrammingLanguagesRequest$(
    searchParams: ObjectType
  ): Observable<FilterRecourseProgrammingLanguages> {
    return this._http.get<FilterRecourseProgrammingLanguages>(
      `${environment.filterRecourseUrl}/${this.programmingLanguages}`,
      {
        params: searchParams,
      }
    );
  }

  public getFilterRecourseProgrammingFrameworksRequest$(
    searchParams: ObjectType
  ): Observable<FilterRecourseProgrammingFrameworks> {
    return this._http.get<FilterRecourseProgrammingFrameworks>(
      `${environment.filterRecourseUrl}/${this.languagesFrameworks}`,
      {
        params: searchParams,
      }
    );
  }

  public getFilterRecourseUniversityRequest$(): Observable<FilterRecourseUniversity> {
    return this._http.get<FilterRecourseUniversity>(`${environment.filterRecourseUrl}/${this.university}`);
  }

  public getLanguages$(): Observable<SearchableSelectDataInterface[]> {
    return of(languages);
  }

  public updateCurrentPageRobot(uuid: string): Observable<ObjectType> {
    const fullUrl = `${environment.url}/${this.robot_helper}/${uuid}`;
    return this._http.put<ObjectType>(fullUrl, { hidden: "true" });
  }
}
