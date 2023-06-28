import { Injectable } from "@angular/core";
import { CompanyService } from "./company.service";
import { Observable } from "rxjs";
import { ISearchCompany, ISearchCompanyResult } from "src/app/shared/interfaces/search-company.interface";
import { ISearch } from "src/app/shared/interfaces/searc.interface";

@Injectable({
  providedIn: "root",
})
export class CompanyFacade {
  constructor(private _companyService: CompanyService) {}

  public getCompanyInfo$(uuid: string): Observable<ISearchCompany> {
    return this._companyService.getCompanyInfo(uuid);
  }

  public getCompanyAllVacancy$(companyUuId: string, vacancyUuid?: string, searchParams?: ISearch): Observable<ISearchCompanyResult> {
    return this._companyService.getCompanyAllVacancy(companyUuId, vacancyUuid, searchParams);
  }

  public getCompanyLogo(logo: string): string {
    return this._companyService.getCompanyLogo(logo)
  }

  public getAllCompany$(searchParam?: ISearch): Observable<ISearchCompanyResult> {
    return this._companyService.getAllCompany$(searchParam);
  }

}
