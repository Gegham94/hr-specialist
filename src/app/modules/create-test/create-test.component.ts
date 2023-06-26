import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { LocalStorageService } from "../../root-modules/app/services/local-storage.service";
import { Unsubscribe } from "../../shared-modules/unsubscriber/unsubscribe";
import { ITabs } from "../../root-modules/app/interfaces/tab-filter.interface";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-create-test",
  templateUrl: "./create-test.component.html",
  styleUrls: ["./create-test.component.scss"],
})
export class CreateTestComponent extends Unsubscribe implements OnInit, OnDestroy {
  public readonly localSaveName = "test-type";
  public activeTab: Subject<string> = new Subject<string>();
  public readonly tabs: ITabs[] = [
    { value: "quiz", displayName: "Начать теоретический тест" },
    { value: "compiler", displayName: "Начать тест компилятора" },
  ];

  constructor(private readonly _localStorageService: LocalStorageService, private router: Router) {
    super();
  }

  public ngOnInit(): void {
    this.router.events.pipe(takeUntil(this.ngUnsubscribe)).subscribe((navigation) => {
      if (navigation instanceof NavigationEnd) {
        if (this.router.url === "/employee/create-test/quiz") {
          this._localStorageService.setItem(this.localSaveName, JSON.stringify(this.tabs[0].value));
          this.activeTab.next(this.tabs[0].value);
        } else {
          this._localStorageService.setItem(this.localSaveName, JSON.stringify(this.tabs[1].value));
          this.activeTab.next(this.tabs[1].value);
        }
      }
    });
  }

  public changeTab(tab: string) {
    if (tab === this.tabs[0].value) {
      this.router.navigateByUrl("/employee/create-test/quiz");
    } else {
      this.router.navigateByUrl("/employee/create-test/compiler");
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
