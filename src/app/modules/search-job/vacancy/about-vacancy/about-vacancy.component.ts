import {Component, OnDestroy, OnInit, ChangeDetectionStrategy} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, Observable, takeUntil} from "rxjs";
import {Unsubscribe} from "../../../../shared/unsubscriber/unsubscribe";
import {IVacancy} from "../interfaces/search-vacancy.interface";
import {LocalStorageService} from "../../../../shared/services/local-storage.service";
import {DateFormatEnum} from "../../../profile/enums/date-format.enum";
import {ProgrammingLevelEnum} from "../../../../shared/constants/programming-level.enum";
import { VacancyFacade } from "../services/vacancy.facade";

@Component({
  selector: "app-about-vacancy",
  templateUrl: "./about-vacancy.component.html",
  styleUrls: ["./about-vacancy.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutVacancyComponent extends Unsubscribe implements OnInit, OnDestroy {
  public getVacancyInfo$!: Observable<IVacancy>;
  public isModal: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isResumeApplied$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private companyId: string = "";
  private vacancyId: string = "";
  public DateFormatEnum = DateFormatEnum;
  public ProgrammingLevelEnum = ProgrammingLevelEnum;

  constructor(private activeRoute: ActivatedRoute,
              private _vacancyFacade: VacancyFacade,
              private localStorageService: LocalStorageService,
              private route: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    this.isResumeApplied$.next(false);
    this.getVacancy();
  }

  private getVacancy(): void {
    this.activeRoute.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      this.companyId = params["companyUuid"];
      this.vacancyId = params["vacancyUuid"];
      this.route.navigate(["/employee/search/vacancy/about-vacancy"], {
        queryParams: {companyUuid: this.companyId, vacancyUuid: this.vacancyId},
      });
      this.getVacancyInfo$ = this._vacancyFacade.getVacancyByUuId(this.companyId, this.vacancyId)
    });
  }

  public applyResume() {
    this.isModal.next(true);
  }

  public cancel(): void {
    this.isModal.next(false);
  }

  public send(): void {
    this._vacancyFacade.requestJob(this.companyId, this.vacancyId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.cancel();
          this.isResumeApplied$.next(true);
        });
  }

  ngOnDestroy(): void {
    this.localStorageService.removeData("company-uuid");
    this.localStorageService.removeData("vacancy-uuid");
    this.unsubscribe();
  }
}
