import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {
  SearchCompanyInterface,
  SearchCompanyResultInterface
} from "../../../root-modules/app/interfaces/search-company.interface";
import {SearchInterface} from "../../../root-modules/app/interfaces/searc.interface";
import {SpecialistJobRequestInterface} from "../../../root-modules/app/interfaces/specialist-job-request.interface";

@Injectable({
  providedIn: "root"
})

export class CompanyService {

  private readonly searchAllCompany = "company/all";
  private readonly companyLogo = "company/logo";
  private readonly companyInfo = "company/info";
  private readonly companyVacancy = "company/vacancy";
  private readonly sendJobRequest = "/specialist/send-job-request";

  constructor(private readonly http: HttpClient) {
  }

  public getCompanyLogo(logo: File | string): string {
    return `${environment.logo}/${this.companyLogo}/${logo}`;
  }

  public getCompanyInfo(uuid: string): Observable<SearchCompanyInterface> {
    return this.http.get<SearchCompanyInterface>(`${environment.companySearch}${this.companyInfo}/${uuid}`);
  }

  public getCompanyAllVacancy(
    companyUuid: string,
    vacancyUuid?: string,
    searchParams?: SearchInterface):
    Observable<SearchCompanyResultInterface> {

    if (searchParams) {
      return this.http.get<SearchCompanyResultInterface>(`${environment.companySearch}${this.companyVacancy}/${companyUuid}`, {
        params: {...searchParams}
      });
    }

    if (vacancyUuid) {
      return this.http.get<SearchCompanyResultInterface>
      (`${environment.companySearch}${this.companyVacancy}/${companyUuid}?uuid=${vacancyUuid}`);
    }

    return this.http.get<SearchCompanyResultInterface>(`${environment.companySearch}${this.companyVacancy}/${companyUuid}`);
  }

  public getAllCompany$(searchParams?: SearchInterface): Observable<SearchCompanyResultInterface> {

    return this.http.get<SearchCompanyResultInterface>(`${environment.companySearch}${this.searchAllCompany}`,
      {
        params: {
          ...searchParams
        }
      }
    );
  }

  public setSpecialistVacancy$(vacancyId: string, companyId: string): Observable<SpecialistJobRequestInterface> {
    return this.http.post<SpecialistJobRequestInterface>(`${environment.url}${this.sendJobRequest}`,
      {vacancyUuid: vacancyId, companyUuid: companyId}
    );
  }

}
