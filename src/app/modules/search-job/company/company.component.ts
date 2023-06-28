import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  filter,
  finalize,
  Observable,
  of,
  retry,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from "rxjs";

import { Router } from "@angular/router";
import { LocalStorageService } from "../../../shared/services/local-storage.service";
import { RobotHelperService } from "../../../shared/services/robot-helper.service";
import { IEmployee } from "../../../shared/interfaces/employee.interface";
import { Unsubscribe } from "../../../shared/unsubscriber/unsubscribe";
import { SearchParams } from "../../profile/interfaces/search-params";
import { CompanyFacade } from "./services/company.facade";
import { ISearchCompany, ISearchCompanyResult } from "src/app/shared/interfaces/search-company.interface";
import { ISearch } from "src/app/shared/interfaces/searc.interface";

@Component({
  selector: "hr-company-search",
  templateUrl: "./company.component.html",
  styleUrls: ["./company.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyComponent extends Unsubscribe implements OnInit, OnDestroy {
  public countCompany$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public countResult$!: Observable<ISearchCompany[]>;
  public employee$!: Observable<IEmployee>;
  public loader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public hasAllCompanyActiveVacancy: boolean = false;
  public vacanciesCount!: number;
  public currentPage: number = 1;

  private limit: number = 10;

  private searchParam: ISearch = {
    take: 0,
    skip: 0,
    activeVacancy: false,
  };

  private sendValueChangeEvent$: BehaviorSubject<SearchParams | null> = new BehaviorSubject<SearchParams | null>(null);

  constructor(
    private _companyFacade: CompanyFacade,
    private _localStorage: LocalStorageService,
    private _robotHelperService: RobotHelperService,
    private _cdr: ChangeDetectorRef,
    private _route: Router
  ) {
    super();
  }

  ngOnInit() {
    this.loader$.next(true);
    this._robotHelperService.hasSecondRobot$.next(false);
    this.searchParam.activeVacancy = this.hasAllCompanyActiveVacancy;
    this.emptyPagination();
    this.isRobot();

    this.sendValueChangeEvent$
      .pipe(
        debounceTime(500),
        takeUntil(this.ngUnsubscribe),
        switchMap(() => {
          this.loader$.next(true);
          return this.getValuesByFilter(1);
        })
      )
      .subscribe(() => {
        this.loader$.next(false);
        this._cdr.detectChanges();
      });
  }

  public isRobot(): void {
    if (this._localStorage.getItem("resume")) {
      this.employee$ = of(JSON.parse(this._localStorage.getItem("resume")));
    }
    this.employee$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((data) => !!data?.phone)
      )
      .subscribe((data) => {
        const currentPage = data.robot_helper?.find(
          (item: { link: string }) => item.link === "/employee/company-search"
        );

        this._robotHelperService.setRobotSettings({
          content: "Company-search - helper",
          navigationItemId: null,
          isContentActive: true,
        });

        if (currentPage && !currentPage?.hidden) {
          this._robotHelperService.setRobotSettings({
            content: "Company search",
            navigationItemId: null,
            isContentActive: true,
            uuid: currentPage?.uuid,
          });
          this._robotHelperService.isRobotOpen$.next(true);
        }
      });
  }

  public navigate(uuid?: string): void {
    this._localStorage.setItem("company-uuid", JSON.stringify(uuid));
    this._route.navigate(["/employee/search/company/about-company"], { queryParams: { uuid: uuid } });
  }

  public getCompanyLogo(logo: string): string {
    return this._companyFacade.getCompanyLogo(logo);
  }

  private vacanciesPagesCount(count: number): void {
    this.vacanciesCount = Math.ceil(count / this.limit);
  }

  public searchDate(searchParams: ISearch): void {
    this.loader$.next(true);
    searchParams.activeVacancy = this.hasAllCompanyActiveVacancy;
    this.searchParam = searchParams;
    this.emptyPagination();
    this.sendValueChangeEvent$.next(this.searchParam);
  }

  public getSelectedPaginationValue(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.loader$.next(true);
    this.searchParam.skip = (pageNumber - 1) * this.limit;
    this.searchParam.take = this.limit;

    this.getAllCompanies$()
      .pipe(finalize(() => this.loader$.next(false)))
      .subscribe();
  }

  private getValuesByFilter(pageNumber: number): Observable<ISearchCompanyResult> {
    this.currentPage = pageNumber;
    this.searchParam.skip = (pageNumber - 1) * this.limit;
    this.searchParam.take = this.limit;
    return this.getAllCompanies$();
  }

  private getAllCompanies$() {
    return this._companyFacade.getAllCompany$(this.searchParam).pipe(
      takeUntil(this.ngUnsubscribe),
      catchError(() => throwError(() => new Error("request failed"))),
      retry(5),
      tap((company) => {
        if (company.result?.length) {
          this.countCompany$.next(company.count);
          this.vacanciesPagesCount(company.count);
        } else {
          this.countCompany$.next(0);
          this.vacanciesPagesCount(0);
        }
        this.countResult$ = of(company.result);
      })
    );
  }

  public showActiveCompany(event: any): void {
    this.hasAllCompanyActiveVacancy = event.target.checked;
    this.loader$.next(true);
    this.searchParam.activeVacancy = this.hasAllCompanyActiveVacancy;
    this.emptyPagination();
    this.getSelectedPaginationValue(1);
  }

  private emptyPagination(): void {
    if (this.searchParam.activeVacancy) {
      this.searchParam.skip = 0;
      this.searchParam.take = 10;
    }
  }

  public ngOnDestroy() {
    this.unsubscribe();
  }
}
