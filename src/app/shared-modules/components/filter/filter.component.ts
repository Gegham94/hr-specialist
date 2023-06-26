import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { SearchableSelectDataInterface } from "../../../root-modules/app/interfaces/searchable-select-data.interface";
import { SearchTypeEnum } from "../../../root-modules/app/interfaces/search-type.enum";
import { EmployeeInfoFacade } from "../../../modules/profile/components/utils/employee-info.facade";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { Observable, of, Subscription, switchMap, takeUntil } from "rxjs";
import { Unsubscribe } from "../../unsubscriber/unsubscribe";
import { FilterRecourseLocationCities } from "src/app/modules/employee-info/interface/filter-resource-list-city.model";

@Component({
  selector: "hr-filter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.scss"],
})
export class FilterComponent extends Unsubscribe implements OnInit, OnDestroy {
  public selectTypeEnum = {
    country: "countryName",
    city: "cityName",
    university: "universityName",
    programmingLanguage: "languageName",
    framework: "frameworkName",
  };

  @Input("status-list") statusList: any;

  @Input() companyFilter: boolean = false;
  @Output() statusChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() nameChanged: EventEmitter<string> = new EventEmitter<string>();

  public searchListCountry$ = this._employeeFacade.getVacancyLocationCountriesRequest$();

  public searchListCity$ = this._employeeFacade.getVacancyLocationCitiesRequest$();

  public searchListProgrammingLanguages!: SearchableSelectDataInterface[];

  public searchListProgrammingLanguages$ = this._employeeFacade
    .getProgrammingLanguagesRequest$()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((data) => {
      this.searchListProgrammingLanguages = data;
    });

  public searchListFrameworks!: SearchableSelectDataInterface[] | null;

  public searchListFrameworks$ = this._employeeFacade
    .getProgrammingFrameworksRequest$()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((data) => {
      this.searchListFrameworks = data;
    });

  public countryChangeSubscriber!: Subscription;

  public isOpen: boolean = false;
  public filterType = SearchTypeEnum;
  public currentPage: number = 0;
  public value: { [key: string]: string } = {};
  public searchParams = {
    take: 0,
    skip: 0,
  };
  public clickOutside: boolean = false;

  private companyFilterFormGroup!: UntypedFormGroup;

  constructor(private _employeeFacade: EmployeeInfoFacade, private _formBuilder: UntypedFormBuilder) {
    super();
  }

  ngOnInit(): void {
    if (!this.companyFilter) {
      this.isOpen = true;
    }
    this.initForm();
    this.companyValueChanges().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    this.getSelectedPaginationValue(this.currentPage, this.selectTypeEnum.country, true);
    this.getSelectedPaginationValue(this.currentPage, this.selectTypeEnum.city, true);
    this.countryChange();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  get companyFilterNameControl(): UntypedFormControl {
    return this.companyFilterFormGroup?.get("name") as UntypedFormControl;
  }

  get companyFilterCountryControl(): UntypedFormControl {
    return this.companyFilterFormGroup?.get("country") as UntypedFormControl;
  }

  get companyFilterCityControl(): UntypedFormControl {
    return this.companyFilterFormGroup?.get("city") as UntypedFormControl;
  }

  public initForm(): void {
    this.companyFilterFormGroup = this._formBuilder.group({
      name: [""],
      country: [""],
      city: [""],
      address: [""],
    });
  }

  public companyValueChanges(): Observable<FilterRecourseLocationCities | null> {
    return this.companyFilterCountryControl?.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap((country: string) => {
        this.searchParams["take"] = 10;
        this.searchParams["skip"] = 0;
        this.companyFilterCityControl.setValue(null);
        return this._employeeFacade.getCitiesByCountry(this.searchParams, country);
      })
    );
  }

  public scrollDown(type: string): void {
    this.currentPage++;
    this.getSelectedPaginationValue(this.currentPage, type);
  }

  public getSelectedPaginationValue(
    pageNumber: number,
    type?: string,
    reset: boolean = false,
    searchParams = this.searchParams
  ): void {
    const limit = 10;
    const end = pageNumber * limit;
    this.searchParams["take"] = limit;
    this.searchParams["skip"] = end;

    switch (type) {
      case this.selectTypeEnum.country: {
        // @ts-ignore
        delete this.searchParams?.countryId;
        this._employeeFacade.setLocationCountriesRequest$().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
        break;
      }
      case this.selectTypeEnum.city: {
        this._employeeFacade.getCitiesByCountry(this.searchParams, this.companyFilterCountryControl.value).pipe(takeUntil(this.ngUnsubscribe)).subscribe();
        this.companyFilterCityControl.setValue(null);
        break;
      }
      default:
    }
  }

  public toggleFilter(): void {
    this.isOpen = !this.isOpen;
  }

  public sendValue(
    value: string | SearchableSelectDataInterface | SearchableSelectDataInterface[],
    type: string
  ): void {
    let param;

    if (typeof value === "string") {
      param = value;
    } else if (type === this.filterType.COUNTRY && typeof value === "object") {
      param = value["displayName"];
    } else if (type === this.filterType.CITY && typeof value === "object") {
      const cityLists = [];

      // tslint:disable-next-line:forin
      for (const valueKey in value) {
        cityLists.push(value[valueKey].displayName);
      }
      param = cityLists.join();
    }

    if (type === this.filterType.NAME) {
      this.emitChange(param, type);
      return;
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
    this.companyFilterCountryControl?.valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((selectedCountry: SearchableSelectDataInterface[] | string) => {
          if (typeof this.companyFilterCityControl?.value !== "string") {
            this.companyFilterCityControl?.setValue("");
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
