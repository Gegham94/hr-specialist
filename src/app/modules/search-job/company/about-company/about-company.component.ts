import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {map, Observable, takeUntil} from "rxjs";
import {SearchCompanyInterface} from "../../../../root-modules/app/interfaces/search-company.interface";
import {SearchInterface} from "../../../../root-modules/app/interfaces/searc.interface";
import {StatusTypeEnum} from "../../../../root-modules/app/constants/status-type.enum";
import {Unsubscribe} from "../../../../shared-modules/unsubscriber/unsubscribe";
import {CompanyService} from "../company-service";
import {LocalStorageService} from "../../../../root-modules/app/services/local-storage.service";

@Component({
  selector: "hr-about-company",
  templateUrl: "./about-company.component.html",
  styleUrls: ["./about-company.component.scss"]
})

export class AboutCompanyComponent extends Unsubscribe implements OnInit {

  public getCompanyInfo$!: Observable<SearchCompanyInterface>;
  public getCompanyAllVacancy$!: Observable<SearchCompanyInterface[]>;
  public vacanciesCount!: number;
  public uuid!: string;
  private statusTypeEnum = StatusTypeEnum;
  public todayDateString = new Date().toISOString().slice(0, 10);
  public searchParams: SearchInterface = {skip: 0, take: 0, from: this.todayDateString };

  constructor(private activeRoute: ActivatedRoute,
              private companyService: CompanyService,
              private localStorageService: LocalStorageService,
              private route: Router) {
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
    this.activeRoute.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      if (params["uuid"]) {
        this.uuid = params["uuid"];
        this.route.navigate(["/employee/search/company/about-company"],
          {queryParams: {uuid: this.uuid}});
        this.getCompanyInfo$ = this.companyService.getCompanyInfo(this.uuid);
        this.getCompanyAllVacancy$ = this.companyService.getCompanyAllVacancy(
          this.uuid, "", {from: this.todayDateString})
          .pipe(
            map((vacancy) => {
              this.vacanciesPagesCount(vacancy.count);
              return vacancy.result;
            }));
      }
    });
  }

  public getSelectedPaginationValue(pageNumber: number): void {
    const limit = 5;
    this.searchParams.skip = (pageNumber - 1) * limit;
    this.searchParams.take = limit;
    this.searchParams.from = this.todayDateString;

    this.getCompanyAllVacancy$ = this.companyService.getCompanyAllVacancy(this.uuid, "", this.searchParams)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map((vacancies) => {
          this.vacanciesPagesCount(vacancies.count);
          return vacancies.result;
        }));
  }

  public getCompanyLogo(logo: string): string {
    return this.companyService.getCompanyLogo(logo);
  }

  public changeStatus(status: boolean): string {
    return status ? this.statusTypeEnum.OPEN : this.statusTypeEnum.CLOSE;
  }

  public navigate(companyId: string | undefined, vacancyId: string | undefined): void {
    this.route.navigate(["/employee/search/vacancy/about-vacancy"],
      {
        queryParams: {companyUuid: companyId, vacancyUuid: vacancyId}
      }
    );
  }

  ngOnDestroy(): void {
    this.localStorageService.removeData("company-uuid");
    this.unsubscribe();
  }

}
