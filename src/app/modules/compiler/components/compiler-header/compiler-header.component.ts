import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { DatePipe } from "@angular/common";

import { Observable, delay, finalize, map, of, switchMap, take, takeUntil, tap, timer } from "rxjs";

import { ICompilerTestSettings } from "src/app/shared/interfaces/compiler-tests.interface";
import { ScreenSizeService } from "src/app/shared/services/screen-size.service";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { CompilerFacade } from "../../services/compiler.facade";
import { ScreenSizeType } from "src/app/shared/interfaces/screen-size.type";

@Component({
  selector: "hr-compiler-header",
  templateUrl: "./compiler-header.component.html",
  styleUrls: ["./compiler-header.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompilerHeaderComponent extends Unsubscribe implements AfterViewInit, OnInit, OnDestroy {
  public timerValue: string | null = "";
  public darkModeActive: boolean = false;
  public screenSize: ScreenSizeType = "DESKTOP";
  public timeOverModalOpen: boolean = false;
  public testInProgress: boolean = true;
  public testResults: string = "-";

  constructor(
    private readonly datePipe: DatePipe,
    private readonly cdr: ChangeDetectorRef,
    private readonly compilerFacade: CompilerFacade,
    private readonly screenSizeService: ScreenSizeService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.screenSize = this.screenSizeService.calcScreenSize;
    this.screenSizeService.screenSize$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((screenSize) => {
      this.screenSize = screenSize;
      this.cdr.markForCheck();
    });
    this.compilerFacade
      .getCompilerTestSettings$()
      .pipe(
        delay(1000),
        takeUntil(this.ngUnsubscribe),
        switchMap((settings) => {
          if (!settings) {
            return of(null);
          }
          const remainingTime = this.calcRemainingTime(settings);
          if (remainingTime === 0) {
            this.testInProgress = false;
          }
          return this.timer(remainingTime, settings.combinedTestTime);
        })
      )
      .subscribe();
  }

  public ngAfterViewInit(): void {
    if (localStorage.getItem("data-theme") === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      this.darkModeActive = true;
    } else {
      this.darkModeActive = false;
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  public toggleThemeMode(): void {
    this.darkModeActive = !this.darkModeActive;
    if (this.darkModeActive) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("data-theme", "dark");
      this.compilerFacade.changeCompilerTheme$.next("dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("data-theme");
      this.compilerFacade.changeCompilerTheme$.next("light");
    }
  }

  public compileCurrentTest(): void {
    this.compilerFacade.applyCurrentTest$().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
  }

  public setTimeOverModalState(state: boolean): void {
    this.timeOverModalOpen = state;
  }

  private timer(time: number, testTime: number): Observable<number> {
    return timer(0, 1000).pipe(
      map((i) => time - i),
      take(time + 1),
      tap((i) => {
        this.setSeconds(i, testTime);
      }),
      finalize(() => {
        this.testInProgress = false;
        this.applyAllTests();
        this.calcTestResults();
      })
    );
  }

  private calcTestResults(): void {
    this.compilerFacade
      .getCompilerTests$()
      .pipe(take(1))
      .subscribe((tests) => {
        const completedTestsCount = tests.filter((test) => test.result?.success);
        this.testResults = `${completedTestsCount.length}/${tests.length}`;
        this.compilerFacade.setShouldDeactivate(true);
        this.setTimeOverModalState(true);
        this.cdr.markForCheck();
      });
  }

  private applyAllTests(): void {
    this.compilerFacade
      .applyAllTests$()
      .pipe(take(1))
      .subscribe((res) => console.log(res));
  }

  private calcRemainingTime(settings: ICompilerTestSettings): number {
    const startDateValue = settings.dateTimeTestStarted.getTime();
    const nowValue = new Date().getTime();
    const remainingTime = nowValue - startDateValue;
    return remainingTime > settings.combinedTestTime
      ? 0
      : Math.floor((settings.combinedTestTime - remainingTime) / 1000);
  }

  private setSeconds(time: number, testTime: number) {
    let formattedTime: string | null;
    if (time * 1000 >= 3600000) {
      formattedTime = this.datePipe.transform(time * 1000, "hh:mm:ss");
    } else {
      formattedTime = this.datePipe.transform(time * 1000, "mm:ss");
    }
    this.timerValue = formattedTime;
    this.cdr.markForCheck();
    const elementOuter = document.querySelector(".seconds_outer") as HTMLDivElement;
    if (elementOuter) {
      elementOuter.style.background = `conic-gradient(
      rgba(0, 148, 49, 0.9) 0deg,
      rgba(0, 201, 43, 0.9) ${this.countDegs(time * 1000, testTime)}deg,
      transparent 0deg
    )`;
    }
  }

  private countDegs(timeValue: number, total: number) {
    const degs = 365;
    const percentage = Math.round((timeValue * 100) / total);
    const degsOffset = (degs * percentage) / 100;
    return Math.floor(degsOffset);
  }
}
