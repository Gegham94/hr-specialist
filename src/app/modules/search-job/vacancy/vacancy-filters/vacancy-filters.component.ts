import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { Unsubscribe } from "../../../../shared/unsubscriber/unsubscribe";
import { of, switchMap, takeUntil } from "rxjs";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { EmployeeInfoFacade } from "../../../profile/services/employee-info.facade";
import { SelectTypeEnum } from "../enum/select-type.enum";
import { SearchTypeEnum } from "src/app/shared/interfaces/search-type.enum";
import { ISearchableSelectData } from "src/app/shared/interfaces/searchable-select-data.interface";

@Component({
  selector: "hr-vacancy-filters",
  templateUrl: "./vacancy-filters.component.html",
  styleUrls: ["./vacancy-filters.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancyFiltersComponent extends Unsubscribe implements OnInit, OnDestroy {
  public selectType = SelectTypeEnum;

  @Output() statusChanged: EventEmitter<any> = new EventEmitter<any>();

  public searchListCountry$ = this._employeeFacade.getVacancyLocationCountriesRequest$();

  public searchListCity$ = this._employeeFacade.getVacancyLocationCitiesRequest$();

  public employmentTypes$ = this._employeeFacade.getEmploymentTypes$();

  public filterType = SearchTypeEnum;
  public currentPage: number = 0;
  public value: { [key: string]: string } = {};
  public searchParams = {
    take: 10,
    skip: 0,
  };
  public clickOutside: boolean = false;

  private vacancyFilterFormGroup!: UntypedFormGroup;

  constructor(private _employeeFacade: EmployeeInfoFacade, private _formBuilder: UntypedFormBuilder) {
    super();
  }

  public ngOnInit(): void {
    this.initForm();
    this.companyValueChanges();
    this.getSelectedPaginationValue(this.currentPage, this.selectType.country);
    this.getSelectedPaginationValue(this.currentPage, this.selectType.city);
    this.countryChange();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  get vacancyFilterQueryControl(): UntypedFormControl {
    return this.vacancyFilterFormGroup?.get("query") as UntypedFormControl;
  }

  get vacancyFilterCountryControl(): UntypedFormControl {
    return this.vacancyFilterFormGroup?.get("country") as UntypedFormControl;
  }

  get vacancyFilterCityControl(): UntypedFormControl {
    return this.vacancyFilterFormGroup?.get("city") as UntypedFormControl;
  }

  get vacancyFilterWayOfWorkingControl(): UntypedFormControl {
    return this.vacancyFilterFormGroup?.get("wayOfWorking") as UntypedFormControl;
  }

  public initForm(): void {
    this.vacancyFilterFormGroup = this._formBuilder.group({
      query: [""],
      country: [""],
      city: [""],
      wayOfWorking: [""],
    });
  }

  public companyValueChanges(): void {
    this.vacancyFilterCountryControl?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((country: string) => {
      this.searchParams["skip"] = 0;
      this._employeeFacade.getCitiesByCountry(this.searchParams, country);
      this.vacancyFilterCityControl.setValue(null);
    });
  }

  public getSelectedPaginationValue(pageNumber: number, type?: string): void {
    this.searchParams["skip"] = pageNumber * this.searchParams.take;

    switch (type) {
      case this.selectType.country: {
        this._employeeFacade.setLocationCountriesRequest$().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
        break;
      }
      case this.selectType.city: {
        this._employeeFacade.getCitiesByCountry(this.searchParams, this.vacancyFilterCountryControl.value);
        this.vacancyFilterCityControl.setValue(null);
        break;
      }
      default:
    }
  }

  public sendValue(value: string | ISearchableSelectData | ISearchableSelectData[], type: string): void {
    let param;

    if (typeof value === "string") {
      param = value;
    } else if (
      (type === this.filterType.COUNTRY || type === this.filterType.WAYOFWORKING) &&
      typeof value === "object"
    ) {
      param = value["displayName"];
    } else if (type === this.filterType.CITY && typeof value === "object") {
      const cityLists = [];

      for (const valueKey in value) {
        cityLists.push(value[valueKey].displayName);
      }
      param = cityLists.join();
    }

    if (!this.clickOutside) {
      this.emitChange(param, type);
    }
  }

  private emitChange(value: string, type: string): void {
    const objectForSearchValue = {
      [type]: value,
    };

    Object.assign(this.value, objectForSearchValue);

    const objectValue = Object.values(this.value);
    const objectKey = Object.keys(this.value);

    objectValue.forEach((item, index) => {
      if (Object.values(this.value)[index] === "" || Object.values(this.value)[index] === undefined) {
        delete this.value[objectKey[index]];
      }
    });

    this.statusChanged.emit(this.value);
  }

  private countryChange(): void {
    this.vacancyFilterCountryControl?.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((selectedCountry: ISearchableSelectData[] | string) => {
          if (typeof this.vacancyFilterCityControl?.value !== "string") {
            this.vacancyFilterCityControl?.setValue("");
          }
          if (typeof selectedCountry !== "string" && selectedCountry && selectedCountry.length) {
            const uuId = selectedCountry[0].id as string;
            return this._employeeFacade.setLocationCitiesRequest$({ countryId: uuId });
          }
          return of(null);
        })
      )
      .subscribe();
  }
}
