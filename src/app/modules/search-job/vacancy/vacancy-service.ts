import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {SearchInterface} from "../../../root-modules/app/interfaces/searc.interface";
import {SpecialistJobRequestInterface} from "../../../root-modules/app/interfaces/specialist-job-request.interface";
import {environment} from "../../../../environments/environment";
import {SearchVacancyResultInterface, VacancyInterface} from "./interfaces/search-vacancy.interface";

@Injectable({
  providedIn: "root"
})

export class VacancyService {

  private readonly searchAllVacancies = "company/vacancy/search/all";
  private readonly sendJobRequest = "specialist/send-job-request";
  private readonly companyVacancy = "company/vacancy";

  constructor(private readonly http: HttpClient) {
  }

  public getVacancyByUuids(
    companyUuid: string,
    vacancyUuid: string,
  ):
    Observable<VacancyInterface> {

    return this.http.get<VacancyInterface>(`${environment.companySearch}${this.companyVacancy}/${companyUuid}?uuid=${vacancyUuid}`);
  }

  public getAllVacancies$(searchParams?: SearchInterface): Observable<SearchVacancyResultInterface> {

    return this.http.get<SearchVacancyResultInterface>(`${environment.companySearch}${this.searchAllVacancies}`,
      {
        params: {
          ...searchParams
        }
      }
    );
  }

  public setSpecialistVacancy$(vacancyId: string, companyId: string): Observable<SpecialistJobRequestInterface> {
    return this.http.post<SpecialistJobRequestInterface>(`${environment.url}/${this.sendJobRequest}`,
      {vacancyUuid: vacancyId, companyUuid: companyId}
    );
  }

}
