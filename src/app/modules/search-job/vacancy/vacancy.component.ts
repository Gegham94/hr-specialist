import {ChangeDetectorRef, Component, OnInit} from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  finalize,
  Observable,
  of,
  retry,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from "rxjs";
import {Unsubscribe} from "../../../shared-modules/unsubscriber/unsubscribe";
import {IEmployee} from "../../../root-modules/app/interfaces/employee.interface";
import {SearchInterface} from "../../../root-modules/app/interfaces/searc.interface";
import {RobotHelperService} from "../../../root-modules/app/services/robot-helper.service";
import {Router} from "@angular/router";
import {VacancyFacade} from "./vacancy.facade";
import {SearchVacancyInterface, SearchVacancyResultInterface} from "./interfaces/search-vacancy.interface";
import {CompanyService} from "../company/company-service";
import {LocalStorageService} from "../../../root-modules/app/services/local-storage.service";

@Component({
  selector: "hr-vacancy-search",
  templateUrl: "./vacancy.component.html",
  styleUrls: ["./vacancy.component.scss"],
})
export class VacancyComponent extends Unsubscribe implements OnInit {
  public countVacancies$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public vacancies$!: Observable<SearchVacancyInterface[]>;
  public vacancies!: Observable<SearchVacancyInterface[]>;
  public loader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public pagesCount: number = 0;
  public employee$!: Observable<IEmployee>;
  public currentPage: number = 1;

  private limit: number = 10;

  private searchParam: SearchInterface = {
    take: 0,
    skip: 0,
  };

  private sendValueChangeEvent$: BehaviorSubject<SearchInterface | null> = new BehaviorSubject<SearchInterface | null>(
    null
  );

  constructor(
    private _vacancyFacade: VacancyFacade,
    private _companyService: CompanyService,
    private _robotHelperService: RobotHelperService,
    private _cdr: ChangeDetectorRef,
    private _localStorageService: LocalStorageService,
    private route: Router
  ) {
    super();
  }

  ngOnInit() {
    this.loader$.next(true);
    this._robotHelperService.hasSecondRobot$.next(false);
    this.emptyPagination();
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

  public getCompanyLogo(logo: string): string {
    return this._companyService.getCompanyLogo(logo);
  }

  public navigate(companyId: string, vacancyId: string): void {
      this._localStorageService.setItem("company-uuid", JSON.stringify(companyId));
      this._localStorageService.setItem("vacancy-uuid", JSON.stringify(vacancyId));
      this.route.navigate(["/employee/search/vacancy/about-vacancy"], {
        queryParams: {companyUuid: companyId, vacancyUuid: vacancyId},
      });
  }

  private vacanciesPagesCount(count: number): void {
    this.pagesCount = Math.ceil(count / this.limit);
  }

  public searchDate(searchParams: SearchInterface): void {
    this.loader$.next(true);
    this.searchParam = searchParams;
    this.emptyPagination();
    this.sendValueChangeEvent$.next(this.searchParam);
  }

  public getSelectedPaginationValue(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.loader$.next(true);
    this.searchParam.skip = (pageNumber - 1) * this.limit;
    this.searchParam.take = this.limit;
    this._vacancyFacade
      .getAllVacancies$(this.searchParam)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        catchError(() => throwError(() => new Error("request failed"))),
        retry(5),
        tap((vacancy) => {
          this.countVacancies$.next(vacancy.count);
          this.vacanciesPagesCount(vacancy.count);
          this.vacancies$ = of(vacancy.data);
        }),
        finalize(() => this.loader$.next(false))
      )
      .subscribe();
  }

  private getValuesByFilter(pageNumber: number): Observable<SearchVacancyResultInterface> {
    this.currentPage = pageNumber;
    this.searchParam.skip = (pageNumber - 1) * this.limit;
    this.searchParam.take = this.limit;
    return this._vacancyFacade.getAllVacancies$(this.searchParam).pipe(
      takeUntil(this.ngUnsubscribe),
      catchError(() => throwError(() => new Error("request failed"))),
      retry(5),
      tap((vacancy) => {
        this.countVacancies$.next(vacancy.count);
        this.vacanciesPagesCount(vacancy.count);
        this.vacancies$ = of(vacancy.data);
      })
    );
  }

  public emptyPagination(): void {
    this.searchParam.skip = 0;
    this.searchParam.take = 10;
  }

  public ngOnDestroy() {
    this.unsubscribe();
  }
}
