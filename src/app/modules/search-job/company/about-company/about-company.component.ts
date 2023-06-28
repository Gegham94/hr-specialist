import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable, takeUntil } from "rxjs";
import { Unsubscribe } from "../../../../shared/unsubscriber/unsubscribe";
import { LocalStorageService } from "../../../../shared/services/local-storage.service";
import { CompanyFacade } from "../services/company.facade";
import { ISearchCompany } from "src/app/shared/interfaces/search-company.interface";
import { ISearch } from "src/app/shared/interfaces/searc.interface";

@Component({
  selector: "hr-about-company",
  templateUrl: "./about-company.component.html",
  styleUrls: ["./about-company.component.scss"],
})
export class AboutCompanyComponent extends Unsubscribe implements OnInit, OnDestroy {
  public companyInfo$!: Observable<ISearchCompany>;
  public companyAllVacancy$!: Observable<ISearchCompany[]>;
  public vacanciesCount!: number;
  public uuid!: string;
  public todayDateString = new Date().toISOString().slice(0, 10);
  public searchParams: ISearch = { skip: 0, take: 0, from: this.todayDateString };

  constructor(
    private _activeRoute: ActivatedRoute,
    private _localStorageService: LocalStorageService,
    private _companyFacade: CompanyFacade,
    private _route: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.getCompanyInfo();
    this.getSelectedPaginationValue(1);
  }

  private vacanciesPagesCount(count: number): void {
    const limit = 10;
    this.vacanciesCount = Math.ceil(count / limit);
  }

  private getCompanyInfo(): void {
    this._activeRoute.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      if (params["uuid"]) {
        this.uuid = params["uuid"];
        this._route.navigate(["/employee/search/company/about-company"], { queryParams: { uuid: this.uuid } });
        this.companyInfo$ = this._companyFacade.getCompanyInfo$(this.uuid);

        this.companyAllVacancy$ = this.getCompanyAllVacancy$(this.uuid, "", { from: this.todayDateString });
      }
    });
  }

  public getSelectedPaginationValue(pageNumber: number): void {
    const limit = 5;
    this.searchParams.skip = (pageNumber - 1) * limit;
    this.searchParams.take = limit;
    this.searchParams.from = this.todayDateString;

    this.companyAllVacancy$ = this.getCompanyAllVacancy$(this.uuid, "", this.searchParams);
  }

  private getCompanyAllVacancy$(
    companyUuId: string,
    vacancyUuid: string,
    searchParam: ISearch
  ): Observable<ISearchCompany[]> {
    return this._companyFacade.getCompanyAllVacancy$(companyUuId, vacancyUuid, searchParam).pipe(
      takeUntil(this.ngUnsubscribe),
      map((vacancies) => {
        this.vacanciesPagesCount(vacancies.count);
        return vacancies.result;
      })
    );
  }

  public getCompanyLogo(logo: string): string {
    return this._companyFacade.getCompanyLogo(logo);
  }

  public navigate(companyId: string | undefined, vacancyId: string | undefined): void {
    this._route.navigate(["/employee/search/vacancy/about-vacancy"], {
      queryParams: { companyUuid: companyId, vacancyUuid: vacancyId },
    });
  }

  ngOnDestroy(): void {
    this._localStorageService.removeData("company-uuid");
    this.unsubscribe();
  }
}
