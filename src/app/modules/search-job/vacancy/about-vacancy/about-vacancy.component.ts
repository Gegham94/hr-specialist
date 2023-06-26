import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, Observable, takeUntil} from "rxjs";
import {VacancyService} from "../vacancy-service";
import {Unsubscribe} from "../../../../shared-modules/unsubscriber/unsubscribe";
import {VacancyInterface} from "../interfaces/search-vacancy.interface";
import {LocalStorageService} from "../../../../root-modules/app/services/local-storage.service";

@Component({
  selector: "app-about-vacancy",
  templateUrl: "./about-vacancy.component.html",
  styleUrls: ["./about-vacancy.component.scss"],
})
export class AboutVacancyComponent extends Unsubscribe implements OnInit, OnDestroy {
  public getVacancyInfo$!: Observable<VacancyInterface>;
  public isModal: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isResumeApplied$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private companyId: string = "";
  private vacancyId: string = "";

  constructor(private activeRoute: ActivatedRoute,
              private vacancyService: VacancyService,
              private localStorageService: LocalStorageService,
              private route: Router
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
      this.getVacancyInfo$ = this.vacancyService.getVacancyByUuids(this.companyId, this.vacancyId);
    });
  }

  public applyResume() {
    this.isModal.next(true);
  }

  public cancel(): void {
    this.isModal.next(false);
  }

  public send(): void {
    this.vacancyService
      .setSpecialistVacancy$(this.vacancyId, this.companyId)
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
