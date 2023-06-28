import {Injectable} from "@angular/core";
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {TestInterface, TestInterfaceQuiz} from "../enum/test-item.interface";
import { SearchParams } from "../../profile/interfaces/search-params";

@Injectable({
  providedIn: "root"
})

export class CreateTestService {
  constructor(private readonly _httpClient: HttpClient) { }

  public getSpecialistCompilerTest(position: string, searchValue?: SearchParams): Observable<TestInterface> {
    let getTest = `${environment.test}template`;
    let queryParams = new HttpParams();
    if (searchValue?.languageUuids) {
      searchValue.languageUuids.forEach((language) => {
        queryParams = queryParams.append("languageUuids", language);
      });
    }
    queryParams = queryParams.append("take", searchValue?.take ?? 12);
    queryParams = queryParams.append("skip", searchValue?.skip ?? 0);
    return this._httpClient.get<TestInterface>(`${getTest}/${position}/specialist`,
      {params: queryParams}
    );
  }

  public getSpecialistQuizTest(position: string, searchValue?: SearchParams): Observable<TestInterfaceQuiz> {
    const searchedSettings = JSON.stringify({
      programmingLanguages: searchValue?.programmingLanguages,
      vacancyLevel: position,
      take: searchValue?.take ?? 12,
      skip: searchValue?.skip ?? 0
    });
    const queryParams = new HttpParams().set('searchedSettings', searchedSettings)
    const url = `${environment.recruiter}/recruiter/test`;
    return this._httpClient.get<TestInterfaceQuiz>(`${url}`, {params: queryParams}); 
  }
}
