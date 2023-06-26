import {Component, OnInit} from "@angular/core";
import {NavigationEnd, Router} from "@angular/router";
import {ITabs} from "../../root-modules/app/interfaces/tab-filter.interface";
import {Subject, takeUntil} from "rxjs";
import {Unsubscribe} from "../../shared-modules/unsubscriber/unsubscribe";
import {LocalStorageService} from "../../root-modules/app/services/local-storage.service";


@Component({
  selector: "hr-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"]
})
export class SearchComponent extends Unsubscribe implements OnInit {

  public readonly localSaveName = "search-job-type";
  public readonly tabs: ITabs[] = [
    {value: "company", displayName: "Искать компанию"},
    {value: "vacancy", displayName: "Искать вакансию"}
  ];

  public activeTab: Subject<string> = new Subject<string>();

  constructor(
    private readonly router: Router,
    private readonly localStorageService: LocalStorageService,
  ) {
    super();
  }

  public ngOnInit() {
    this.router.events
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((navigation) => {
        if (navigation instanceof NavigationEnd) {
          if (this.router.url === "/employee/search/company") {
            this.localStorageService.setItem(this.localSaveName, JSON.stringify(this.tabs[0].value));
            this.activeTab.next(this.tabs[0].value);
          } else if (this.router.url === "/employee/search/vacancy"){
            this.localStorageService.setItem(this.localSaveName, JSON.stringify(this.tabs[1].value));
            this.activeTab.next(this.tabs[1].value);
          }
        }
      });
  }

  public changeTab(tab: string) {
    if (tab === this.tabs[0].value) {
      this.router.navigateByUrl("/employee/search/company");
    } else {
      this.router.navigateByUrl("/employee/search/vacancy");
    }
  }

  public ngOnDestroy() {
    this.unsubscribe();
  }
}
