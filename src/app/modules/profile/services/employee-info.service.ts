import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, of } from "rxjs";
import { FilterRecourseUniversity } from "src/app/modules/profile/interfaces/filter-recource-university.model";
import { ObjectType } from "src/app/shared/types/object.type";
import { environment } from "src/environments/environment";
import { employmentTypes } from "../../../shared/constants/employment-type.enum";
import { IEmployee } from "src/app/shared/interfaces/employee.interface";
import { FilterRecourseLocationCountries } from "../interfaces/filter-resource-countryies.model";
import { FilterRecourseLocationCities } from "../interfaces/filter-resource-list-city.model";
import {
  FilterRecourseProgrammingFrameworks,
  FilterRecourseProgrammingLanguages,
} from "../interfaces/filter-recourse-programming-languages.mode";
import { languages } from "../mock/specialist-mock";
import { ISearchableSelectData } from "src/app/shared/interfaces/searchable-select-data.interface";

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

  public getEmploymentTypes$(): Observable<ISearchableSelectData[]> {
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

  public getLanguages$(): Observable<ISearchableSelectData[]> {
    return of(languages);
  }

  public updateCurrentPageRobot(uuid: string): Observable<ObjectType> {
    const fullUrl = `${environment.url}/${this.robot_helper}/${uuid}`;
    return this._http.put<ObjectType>(fullUrl, { hidden: "true" });
  }
}
