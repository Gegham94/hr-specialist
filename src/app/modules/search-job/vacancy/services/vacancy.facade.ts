import { Injectable } from "@angular/core";
import { VacancyService } from "./vacancy.service";
import { Observable } from "rxjs";
import { ISearchVacancyResult, IVacancy } from "../interfaces/search-vacancy.interface";
import { CompanyService } from "../../company/services/company.service";
import { ISearch } from "src/app/shared/interfaces/searc.interface";
import { ISpecialistJobRequest } from "src/app/shared/interfaces/specialist-job-request.interface";

@Injectable({
  providedIn: "root",
})
export class VacancyFacade {
  constructor(private readonly _vacancyService: VacancyService, private _companyService: CompanyService) {}

  public getAllVacancies$(searchParams: ISearch): Observable<ISearchVacancyResult> {
    return this._vacancyService.getAllVacancies$(searchParams);
  }

  public getCompanyLogo$(logo: string): string {
    return this._companyService.getCompanyLogo(logo);
  }

  public getVacancyByUuId(companyId: string, vacancyId: string): Observable<IVacancy> {
    return this._vacancyService.getVacancyByUuids(companyId, vacancyId);
  }

  public requestJob(companyId: string, vacancyId: string): Observable<ISpecialistJobRequest> {
    return this._vacancyService.setSpecialistVacancy$(vacancyId, companyId);
  }
}
