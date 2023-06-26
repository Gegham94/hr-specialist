import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { DatePipe } from '@angular/common';
import { Unsubscribe } from "../../../shared-modules/unsubscriber/unsubscribe";
import { MonacoEditorConstructionOptions } from "@materia-ui/ngx-monaco-editor";
import { CompilerFacade } from "./compiler.facade";
import { ActivatedRoute } from "@angular/router";
import { CanComponentDeactivate } from "../../../shared/guards/compiler-tests-leave.guard";
import {
  BehaviorSubject,
  Observable,
  switchMap,
  takeUntil,
  tap,
  Subject,
  map,
  of,
  combineLatest,
  take,
  interval ,
} from "rxjs";
import { CompilerState } from "./compiler.state";
import {
  CompilerTest,
  ICompilerTestOutput,
  ICompilerTestRequest,
  ICompilerTestResponse,
  ICompilerTestResponseSettings,
} from "src/app/shared/interfaces/compiler-tests.interface";
import { ISelectBoxOptions } from "../../../root-modules/app/interfaces/select-box.interface";
import { NgxIndexedDBService } from "ngx-indexed-db";

@Component({
  selector: "app-compiler",
  templateUrl: "./compiler.component.html",
  styleUrls: ["./compiler.component.scss"],
})
export class CompilerComponent extends Unsubscribe implements OnInit, AfterViewInit, OnDestroy, CanComponentDeactivate {
  public tests: BehaviorSubject<ICompilerTestResponse[] | null> = new BehaviorSubject<ICompilerTestResponse[] | null>(null);
  public selectLightMode: boolean = false;
  public editorOptions: MonacoEditorConstructionOptions = {
    language: "javascript",
    theme: localStorage.getItem("data-theme") === "dark" ? "vs-dark" : "vs",
    minimap: { enabled: true },
    automaticLayout: true,
  };
  public currentTestIndex: number = 0;

  public testUuid = this._activatedRoute.snapshot.queryParams["uuid"];
  public displayTestName = this._activatedRoute.snapshot.queryParams["displayLanguage"];
  public remainingTime = this._activatedRoute.snapshot.queryParams["fullRemainingTime"];
  public remainingFixedTime = this._activatedRoute.snapshot.queryParams["fullRemainingFixedTime"];
  public testsLengthCounter = parseInt(this._activatedRoute.snapshot.queryParams["testsLengthCounter"]);

  public startTestNotifier$: Subject<void> = new Subject<void>();
  public clickNotifier$: Subject<void> = new Subject<void>();
  public navigationStatus$: Subject<boolean> = new Subject<boolean>();

  public selectBoxOptions: ISelectBoxOptions = {
    isReversed: true,
    isOpen: false,
    label: "Тесты",
    optionsLabel: "Тест",
  };

  public successTestsCount: number = 0;
  public testOutput$!: Observable<ICompilerTestOutput>;
  public testsLength$: Observable<number> = this._compilerState.getTestsLength();
  public compilerTests$: Observable<CompilerTest[] | null> = this._compilerState.getCompilerTests();
  public selectedTest$: Observable<CompilerTest | null> = this._compilerState.getSelectedTest().pipe(
    tap((test) => {
      if (test) {
        this.editorOptions.language = test.monacoEditorKey;
        this.currentTestIndex = test.index;
      }
    })
  );

  private timerStartCount: number = 0;
  private timerStartCountFixed: number = 0;
  private stopTimer$ = new Subject<void>();
  public isAllTestsApplied: boolean = false;

  public displayRemainingFixedTime: Date = new Date(new Date().setHours(0, 0, 0, 0));
  public isModalOpenFail: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isModalOpenTimeOver: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isCompileBtnDisable: boolean = false;
  public isOutputLoader: boolean = false;

  constructor(
    private _compilerFacade: CompilerFacade,
    private _compilerState: CompilerState,
    private _activatedRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private readonly indexedDb: NgxIndexedDBService,
    private datePipe: DatePipe,
  ) { super() }

  private updateCompilerTestsIndexDb() {
    return this.compilerTests$.pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap((tests) => {
        if(tests){
            return this.indexedDb.update<{ data: CompilerTest[] | null; settings: ICompilerTestResponseSettings; id: 1 }>("compilerTests", {
              data: tests,
              id: 1,
              settings: {
                displayTestName: this.displayTestName,
                remainingTime: this.remainingTime,
                remainingFixedTime: this.remainingFixedTime,
                testsLengthCounter: this.testsLengthCounter,
              },
            });
        } else {
          return of(null);
        }
      })
    )
  }

  public clearCompilerTestsIndexDb(): Observable<boolean> {
    return this.indexedDb.clear("compilerTests");
  }

  public ngOnInit(): void {
    this._compilerFacade
      .setTestsById(
        this.testUuid,
        this.displayTestName,
        this.remainingTime,
        this.remainingFixedTime,
        this.testsLengthCounter,
      )
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((res) => {
          if (res) {
            this.timerStartCount = res.settings.remainingTime ? parseInt(res.settings.remainingTime) : 0;
            this.timerStartCountFixed = res.settings.remainingFixedTime ? parseInt(res.settings.remainingFixedTime) : 0;
            this.displayRemainingFixedTime = new Date(new Date().setHours(0, 0, 0, this.timerStartCountFixed));
            this.testsLengthCounter = res.settings.testsLengthCounter ? res.settings.testsLengthCounter : 0;
          }
          return this._compilerState.setCompilerTestByIndex(0);
        }),
        switchMap(() => {
          return this.getTimer(this.timerStartCount);
        })
      ).subscribe();
  }

  public setSeconds(time: number) {
    let formattedTime: string | null;
    if (time >= 3600000) {
      formattedTime = this.datePipe.transform(time, 'hh:mm:ss');
    } else {
      formattedTime = this.datePipe.transform(time, 'mm:ss');
    }
    const elementOuter = document.querySelector(".seconds_outer") as HTMLDivElement;
    const elementInner = document.querySelector(".seconds_inner") as HTMLDivElement;
    elementInner!.textContent = formattedTime;
    elementOuter!.style.background = `conic-gradient(
      rgba(0, 148, 49, 0.9) 0deg,
      rgba(0, 201, 43, 0.9) ${this.countDegs(time, this.timerStartCountFixed)}deg,
      transparent 0deg
    )`;
  };

  public countDegs (timeValue: number, total: number) {
    const degs = 365;
    const percentage = Math.round((timeValue * 100) / total);
    const degsOffset = (degs * percentage) / 100;
    return Math.floor(degsOffset);
  };

  public canDeactivate(): boolean | Observable<boolean> {
    this.modalToggleFail(true);
    return combineLatest([this.navigationStatus$, this.clickNotifier$]).pipe(map(([boolean, smth]) => boolean));
  }

  public modalToggleFail(val: boolean) {
    this.isModalOpenFail.next(val ? val : !this.isModalOpenFail);
    document.body.style.overflowY = 'scroll';
  }

  public modalToggleTimeOver(val: boolean) {
    this.isModalOpenTimeOver.next(val ? val : !this.isModalOpenTimeOver);
    document.body.style.overflowY = 'scroll';
  }

  public confirmTimeOver(){
    this.modalToggleTimeOver(false);
  }

  public isCanNavigate(action: boolean){
    if(action){
      this.compilerTests$.pipe(
        takeUntil(this.ngUnsubscribe),
        tap((tests) => {
          if(!this.isAllTestsApplied) {
            const objectForTests =  this.createTestsObjectForApply(tests);
            this.applyAllTestsAnswer(objectForTests);
          }
        })
      ).subscribe();
      this.clearCompilerTestsIndexDb().pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap(()=> {
          this.stopTimer$.next();
          this.stopTimer$.complete();
          localStorage.removeItem('isInTests');
          this._compilerState.setShouldDeactivate(true);
          this.clickNotifier$.next();
          this.navigationStatus$.next(true);
          this.modalToggleFail(false);
          return of(action);
        })
      ).subscribe();
    } else {
      this._compilerState.setShouldDeactivate(false);
      this.modalToggleFail(false);
      this.clickNotifier$.next();
      this.navigationStatus$.next(false)
    }
  }

  public loadPreviousTest(): void {
    this.applyTestChanges(false);
  }

  public loadNextTest(): void {
    this.applyTestChanges(true);
  }

  public toggleThemeMode() {
    this.selectLightMode = !this.selectLightMode;
    if (this.selectLightMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("data-theme", "dark");
      monaco.editor.setTheme("vs-dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("data-theme");
      monaco.editor.setTheme("vs");
    }
  }

  public setSelectedTestByIndex(index: number) {
    this.applyTestChanges(false, index);
  }

  public ngAfterViewInit() {
    if (localStorage.getItem("data-theme") === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      this.selectLightMode = true;
    } else {
      this.selectLightMode = false;
    }
  }

  public ngOnDestroy(): void {
    this.stopTimer$.next();
    this.stopTimer$.complete();
    this.unsubscribe();
  }

  public getTimer(time: number): Observable<CompilerTest[] | null> {
    return interval(1000).pipe(
      takeUntil(this.stopTimer$),
      takeUntil(interval(time+2000)),
      takeUntil(this.ngUnsubscribe),
      switchMap(() => {
        if (time <= 0) {
          return this.compilerTests$.pipe(
            tap((tests) => {
              if(tests){
                this._compilerState.setShouldDeactivate(true);
                localStorage.removeItem('isInTests');
                this.testsLengthCounter = 0;
                this.isCompileBtnDisable = true;
                this.modalToggleTimeOver(true);
                if(!this.isAllTestsApplied) {
                  const objectForTests =  this.createTestsObjectForApply(tests);
                  this.applyAllTestsAnswer(objectForTests);
                }
              }
            })
          );
        } else {
          this.remainingTime = time -= 1000;
          this.setSeconds(this.remainingTime);
          return this.updateCompilerTestsIndexDb().pipe(map(() => null));
        }
      })
    );
  }

  private applyTestChanges(increment: boolean = false, index: number | null = null): void {
    if(!this.isCompileBtnDisable) {
      combineLatest([this.selectedTest$, this._compilerState.getCompilerTests()])
      .pipe(
        take(1),
        takeUntil(this.ngUnsubscribe),
        map(([currentTest, tests]) => {
          console.log(currentTest)
          console.log(tests)
          if (currentTest && tests) {
            tests = tests.map((test) => {
              if (test.index !== this.currentTestIndex) {
                return test;
              }
              return currentTest;
            });
          }
          return tests;
        }),
        switchMap(() => {
          if (index !== null) {
            return this._compilerState.setCompilerTestByIndex((this.currentTestIndex = index));
          } else {
            return this._compilerState.setCompilerTestByIndex(
              increment ? this.currentTestIndex + 1 : this.currentTestIndex - 1
            );
          }
        })
      )
      .subscribe();
    } else {
      combineLatest([this.selectedTest$, this._compilerState.getCompilerTests()])
      .pipe(
        take(1),
        takeUntil(this.ngUnsubscribe),
        switchMap(() => {
          if (index !== null) {
            return this._compilerState.setCompilerTestByIndex((this.currentTestIndex = index));
          } else {
            return this._compilerState.setCompilerTestByIndex(
              increment ? this.currentTestIndex + 1 : this.currentTestIndex - 1
            );
          }
        })
      )
      .subscribe();
    }
  }

  public applyTestAnswer(code: string, testUuid: string) {
    this.isOutputLoader = true;
    this.testOutput$ = this._compilerFacade.applyTestbyId(btoa(code), testUuid).pipe(
      switchMap((result) => {
        return this.selectedTest$.pipe(
          switchMap((test) => {
            if (test) {
              this.testsLengthCounter = this.testsLengthCounter-1;
              if (this.testsLengthCounter === 0) {
                this.isAllTestsApplied = true;
                this.isCompileBtnDisable = true;
                this.stopTimer$.next();
                this.stopTimer$.complete();
              }
              this._compilerState.setShouldDeactivate(true);
              localStorage.removeItem('isInTests');
              test.success = result.success;
              if(result.success){
                this.successTestsCount +=1;
              }
            }
            return of(result);
          }),
        );
      })
    );
    this._cdr.detectChanges();
  }

  public createTestsObjectForApply(tests: CompilerTest[] | null): ICompilerTestRequest{
    let objectForTests: ICompilerTestRequest = {tests: []};
    if (tests) {
      tests.map((obj) => {
        if (obj.success === null) {
          obj.success = false;
          objectForTests.tests.push({
            code: obj.currentExample,
            testingTaskUuid: obj.uuid,
          })
        }
      });
    }
    return objectForTests;
  }

  public applyAllTestsAnswer(tests: ICompilerTestRequest) {
    this.isAllTestsApplied = true;
    this.isCompileBtnDisable = true;
    this.isOutputLoader = true;
    this.testOutput$ = this._compilerFacade.sendApplyAllTests(tests).pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap((result) => {
        this.stopTimer$.next();
        this.stopTimer$.complete();
        return this.compilerTests$.pipe(
          switchMap((tests, index) => {
            if (tests) {
              tests[index].success = result.success;
              if(result.success){
                this.successTestsCount +=1;
              }
            }
            return of(result);
          })
        );
      })
    );
    this.clearCompilerTestsIndexDb().pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap(()=> {
        this.stopTimer$.next();
        this.stopTimer$.complete();
        this._compilerState.setShouldDeactivate(true);
        this.clickNotifier$.next();
        this.navigationStatus$.next(true);
        this.modalToggleFail(false);
        return of(true);
      })
    ).subscribe();
    this._cdr.detectChanges();
  }
}