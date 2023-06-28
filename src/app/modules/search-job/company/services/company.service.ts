import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { ISearchCompany, ISearchCompanyResult } from "src/app/shared/interfaces/search-company.interface";
import { ISearch } from "src/app/shared/interfaces/searc.interface";
import { ISpecialistJobRequest } from "src/app/shared/interfaces/specialist-job-request.interface";

@Injectable({
  providedIn: "root",
})
export class CompanyService {
  private readonly searchAllCompany = "company/all";
  private readonly companyLogo = "company/logo";
  private readonly companyInfo = "company/info";
  private readonly companyVacancy = "company/vacancy";
  private readonly sendJobRequest = "/specialist/send-job-request";

  constructor(private readonly http: HttpClient) {}

  public getCompanyLogo(logo: File | string): string {
    return `${environment.logo}/${this.companyLogo}/${logo}`;
  }

  public getCompanyInfo(uuid: string): Observable<ISearchCompany> {
    return this.http.get<ISearchCompany>(`${environment.companySearch}${this.companyInfo}/${uuid}`);
  }

  public getCompanyAllVacancy(
    companyUuid: string,
    vacancyUuid?: string,
    searchParams?: ISearch
  ): Observable<ISearchCompanyResult> {
    if (searchParams) {
      return this.http.get<ISearchCompanyResult>(`${environment.companySearch}${this.companyVacancy}/${companyUuid}`, {
        params: { ...searchParams },
      });
    }

    if (vacancyUuid) {
      return this.http.get<ISearchCompanyResult>(
        `${environment.companySearch}${this.companyVacancy}/${companyUuid}?uuid=${vacancyUuid}`
      );
    }

    return this.http.get<ISearchCompanyResult>(`${environment.companySearch}${this.companyVacancy}/${companyUuid}`);
  }

  public getAllCompany$(searchParams?: ISearch): Observable<ISearchCompanyResult> {
    return this.http.get<ISearchCompanyResult>(`${environment.companySearch}${this.searchAllCompany}`, {
      params: {
        ...searchParams,
      },
    });
  }

  public setSpecialistVacancy$(vacancyId: string, companyId: string): Observable<ISpecialistJobRequest> {
    return this.http.post<ISpecialistJobRequest>(`${environment.url}${this.sendJobRequest}`, {
      vacancyUuid: vacancyId,
      companyUuid: companyId,
    });
  }
}
