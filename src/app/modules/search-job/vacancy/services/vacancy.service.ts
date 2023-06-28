import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { ISearchVacancyResult, IVacancy } from "../interfaces/search-vacancy.interface";
import { ISpecialistJobRequest } from "src/app/shared/interfaces/specialist-job-request.interface";
import { ISearch } from "src/app/shared/interfaces/searc.interface";

@Injectable({
  providedIn: "root",
})
export class VacancyService {
  private readonly searchAllVacancies = "company/vacancy/search/all";
  private readonly sendJobRequest = "specialist/send-job-request";
  private readonly companyVacancy = "company/vacancy";

  constructor(private readonly http: HttpClient) {}

  public getVacancyByUuids(companyUuid: string, vacancyUuid: string): Observable<IVacancy> {
    return this.http.get<IVacancy>(
      `${environment.companySearch}${this.companyVacancy}/${companyUuid}?uuid=${vacancyUuid}`
    );
  }

  public getAllVacancies$(searchParams?: ISearch): Observable<ISearchVacancyResult> {
    return this.http.get<ISearchVacancyResult>(`${environment.companySearch}${this.searchAllVacancies}`, {
      params: {
        ...searchParams,
      },
    });
  }

  public setSpecialistVacancy$(vacancyId: string, companyId: string): Observable<ISpecialistJobRequest> {
    return this.http.post<ISpecialistJobRequest>(`${environment.url}/${this.sendJobRequest}`, {
      vacancyUuid: vacancyId,
      companyUuid: companyId,
    });
  }
}
