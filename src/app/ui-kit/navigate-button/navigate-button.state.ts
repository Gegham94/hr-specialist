import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { INavigateButton, NavigationButton } from "src/app/shared/interfaces/navigateButton.interface";

@Injectable({
  providedIn: "root",
})
export class NavigateButtonState {
  constructor(private translateService: TranslateService) {}

  private readonly navigations: INavigateButton[] = [
    {
      id: 1,
      text: this.translateService.instant("HEADER.DROPDOWN.MY_PROFILE"),
      icon: "add-vacancy-icon",
      statusType: "disabled",
      link: "/employee/resume",
      activateLink: "/employee/employee-info",
    },
    {
      id: 2,
      text: this.translateService.instant("HEADER.DROPDOWN.PASS_TESTS"),
      statusType: "disabled",
      link: "/employee/create-test/quiz",
      icon: "specialist-icon",
      activateLink: "/employee/create-test",
    },
    {
      id: 3,
      text: this.translateService.instant("HEADER.DROPDOWN.SEARCH_COMPANY"),
      statusType: "disabled",
      icon: "analytic-icon",
      link: "/employee/search/company",
      activateLink: "/employee/company-search",
    },
    {
      id: 4,
      text: this.translateService.instant("HEADER.DROPDOWN.ANALYTICS"),
      statusType: "disabled",
      icon: "analytics",
      link: "/employee/analytics",
      activateLink: "/employee/analytics",
    },
    {
      id: 5,
      text: this.translateService.instant("HEADER.DROPDOWN.MY_CHAT"),
      statusType: "disabled",
      icon: "my-vacancy-icon",
      link: "/employee/chat",
      activateLink: "/employee/chat",
    },
  ];

  get navigationButtons(): INavigateButton[] {
    return this.navigations;
  }

  private navigationButtons$: BehaviorSubject<NavigationButton[] | null> = new BehaviorSubject<
    NavigationButton[] | null
  >(null);

  public setShowedNavigationsMenu(value: NavigationButton[]) {
    this.navigationButtons$.next(value);
  }

  public getShowedNavigationsMenu$(): Observable<NavigationButton[] | null> {
    return this.navigationButtons$;
  }

  public getShowedNavigationsMenu(): NavigationButton[] | null {
    return this.navigationButtons$.value;
  }
}
