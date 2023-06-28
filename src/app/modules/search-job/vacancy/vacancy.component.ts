import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
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
import { Unsubscribe } from "../../../shared/unsubscriber/unsubscribe";
import { RobotHelperService } from "../../../shared/services/robot-helper.service";
import { Router } from "@angular/router";
import { VacancyFacade } from "./services/vacancy.facade";
import { ISearchVacancy, ISearchVacancyResult } from "./interfaces/search-vacancy.interface";
import { LocalStorageService } from "../../../shared/services/local-storage.service";
import { DateFormatEnum } from "../../profile/enums/date-format.enum";
import { ISearch } from "src/app/shared/interfaces/searc.interface";

@Component({
  selector: "hr-vacancy-search",
  templateUrl: "./vacancy.component.html",
  styleUrls: ["./vacancy.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancyComponent extends Unsubscribe implements OnInit {
  public countVacancies$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public vacancies$!: Observable<ISearchVacancy[]>;
  public loader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public pagesCount: number = 0;
  public currentPage: number = 1;

  public DateFormatEnum = DateFormatEnum;

  private searchParam: ISearch = {
    take: 10,
    skip: 0,
  };

  private sendValueChangeEvent$: BehaviorSubject<ISearch | null> = new BehaviorSubject<ISearch | null>(null);

  constructor(
    private _vacancyFacade: VacancyFacade,
    private _robotHelperService: RobotHelperService,
    private _cdr: ChangeDetectorRef,
    private _localStorageService: LocalStorageService,
    private _route: Router
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
    return this._vacancyFacade.getCompanyLogo$(logo);
  }

  public navigate(companyId: string, vacancyId: string): void {
    this._localStorageService.setItem("company-uuid", JSON.stringify(companyId));
    this._localStorageService.setItem("vacancy-uuid", JSON.stringify(vacancyId));
    this._route.navigate(["/employee/search/vacancy/about-vacancy"], {
      queryParams: { companyUuid: companyId, vacancyUuid: vacancyId },
    });
  }

  private vacanciesPagesCount(count: number): void {
    this.pagesCount = Math.ceil(count / this.searchParam.take!);
  }

  public searchDate(searchParams: ISearch): void {
    this.loader$.next(true);
    this.searchParam = searchParams;
    this.emptyPagination();
    this.sendValueChangeEvent$.next(this.searchParam);
  }

  public getSelectedPaginationValue(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.loader$.next(true);
    this.searchParam.skip = (pageNumber - 1) * this.searchParam.take!;
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

  private getValuesByFilter(pageNumber: number): Observable<ISearchVacancyResult> {
    this.currentPage = pageNumber;
    this.searchParam.skip = (pageNumber - 1) * this.searchParam.take!;
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
