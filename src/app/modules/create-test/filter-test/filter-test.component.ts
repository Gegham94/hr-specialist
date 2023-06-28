import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { EmployeeInfoFacade } from "../../profile/services/employee-info.facade";
import { debounceTime, filter, Observable, takeUntil } from "rxjs";
import { specialistPosition } from "../../profile/mock/specialist-mock";
import { FormBuilder, FormControl } from "@angular/forms";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { SearchParams } from "../../profile/interfaces/search-params";
import { SearchTypeEnum } from "src/app/shared/interfaces/search-type.enum";
import { ISearchableSelectData } from "src/app/shared/interfaces/searchable-select-data.interface";

@Component({
  selector: "hr-filter-test",
  templateUrl: "./filter-test.component.html",
  styleUrls: ["./filter-test.component.scss"],
})
export class FilterTestComponent extends Unsubscribe implements OnInit, OnDestroy {
  @Output() statusChanged: EventEmitter<any> = new EventEmitter<any>();
  @Input() testType: "QUIZ" | "COMPILER" = "QUIZ";

  public currentPage: number = 0;
  public allPagesCount: number = 0;
  public filterType = SearchTypeEnum;
  public value: { [key: string]: string } = {};
  public statusListForLevel = specialistPosition;

  public selectTypeEnum = {
    country: "countryName",
    city: "cityName",
    university: "universityName",
    programmingLanguage: "languageName",
    framework: "frameworkName",
  };

  public searchParams: SearchParams = {
    take: 0,
    skip: 0,
  };

  public searchListProgrammingLanguages$!: Observable<ISearchableSelectData[]>;

  public filterForm = this.fb.group({
    languages: new FormControl([]),
    position: new FormControl(""),
  });

  get searchType(): string {
    if (this.testType === "COMPILER") {
      return this.filterType.LANGUAGEUUIDS;
    } else {
      return this.filterType.LANGUAGE;
    }
  }

  constructor(private _employeeFacade: EmployeeInfoFacade, private readonly fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    this._employeeFacade.setAllProgrammingLanguagesRequest$().pipe(takeUntil(this.ngUnsubscribe)).subscribe();

    this.searchListProgrammingLanguages$ = this._employeeFacade.getAllProgrammingLanguages();
    this.getSelectedPaginationValue(this.currentPage, this.selectTypeEnum.programmingLanguage, true);
    this.searchListProgrammingLanguages$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((data) => !!data.length)
      )
      .subscribe((languages) => {
        this.getAllPagesCount(languages[0]?.count || 0);
      });

    this._employeeFacade
      .getEmployee$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((specialist) => {
        specialistPosition.map((position) => {
          if (position.displayName === specialist?.position) {
            this.filterForm.setValue({
              position: position.displayName ?? null,
              languages: JSON.parse(specialist?.languagesFrameworksForSelect).languages,
            });
          }
        });
        this.getSelectedPaginationValue(1);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private getAllPagesCount(count: number): number {
    const limit = 10;
    if (count > 0) {
      this.allPagesCount = count / limit;
    }
    return this.allPagesCount;
  }

  public getSelectedPaginationValue(pageNumber: number, type?: string, reset: boolean = false): void {
    const limit = 10;
    const end = pageNumber * limit;
    this.searchParams["take"] = limit;
    this.searchParams["skip"] = end;
    this._employeeFacade
      .setProgrammingLanguagesRequest$(this.searchParams, reset)
      .pipe(takeUntil(this.ngUnsubscribe), debounceTime(1000))
      .subscribe();
  }

  public emitChange(value: any, type: string): void {
    const objectForSearchValue = {};
    if (value.length > 0) {
      if (type === this.filterType.LANGUAGEUUIDS) {
        objectForSearchValue[type] = value.map((options: ISearchableSelectData) => options.id);
      } else if (type === this.filterType.LANGUAGE) {
        objectForSearchValue[type] = value.map((options: ISearchableSelectData) => options.value);
      }
    } else {
      objectForSearchValue[type] = value.value;
    }
    this.statusChanged.emit(objectForSearchValue);
  }
}
