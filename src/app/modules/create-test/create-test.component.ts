import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { LocalStorageService } from "../../shared/services/local-storage.service";
import { Unsubscribe } from "../../shared/unsubscriber/unsubscribe";
import { Subject, takeUntil } from "rxjs";
import { ITabs } from "src/app/shared/interfaces/tab-filter.interface";
@Component({
  selector: "app-create-test",
  templateUrl: "./create-test.component.html",
  styleUrls: ["./create-test.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTestComponent extends Unsubscribe implements OnInit, OnDestroy {
  public readonly localSaveName = "test-type";
  public activeTab: Subject<string> = new Subject<string>();
  public tabs: ITabs[] = [
    { value: "quiz", displayName: "CREATE_TESTS.QUIZ_TESTS" },
    { value: "compiler", displayName: "CREATE_TESTS.COMPILER_TESTS" },
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
        } else if (this.router.url === "/employee/create-test/compiler") {
          this._localStorageService.setItem(this.localSaveName, JSON.stringify(this.tabs[1].value));
          this.activeTab.next(this.tabs[1].value);
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  public changeTab(tab: string) {
    if (tab === this.tabs[0].value) {
      this.router.navigateByUrl("/employee/create-test/quiz");
    } else {
      this.router.navigateByUrl("/employee/create-test/compiler");
    }
  }
}
