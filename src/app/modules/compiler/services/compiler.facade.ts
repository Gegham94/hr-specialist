import { Injectable } from "@angular/core";

import { BehaviorSubject, Observable, map, of, retry, skip, switchMap, take, takeUntil, tap, throwError } from "rxjs";

import { CompilerService } from "./compiler-service.service";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { CompilerState } from "./compiler.state";
import {
  CompilerTest,
  ICompilerTestSettings,
  ICompilerTestsDb,
} from "src/app/shared/interfaces/compiler-tests.interface";
import { Router } from "@angular/router";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";

@Injectable({
  providedIn: "root",
})
export class CompilerFacade extends Unsubscribe {
  public changeCompilerTheme$: BehaviorSubject<"light" | "dark"> = new BehaviorSubject<"light" | "dark">(
    (localStorage.getItem("data-theme") as "light" | "dark") || "light"
  );
  public selectedLanguageUuid$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private compilerService: CompilerService,
    private compilerState: CompilerState,
    private _router: Router,
    private readonly indexedDb: NgxIndexedDBService
  ) {
    super()
  }

  public checkDbForTests$(): Observable<ICompilerTestsDb | null> {
    return this.indexedDb.getByIndex<ICompilerTestsDb>("compilerTests", "id", 1);
  }

  public getCompilerTestsByLanguageUuid(uuid: string): Observable<null> {
    return this.compilerService.getTestsByLanguage(uuid).pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap((tests) => {
        if (!tests || !tests.data.length) {
          this.setShouldDeactivate(true);
          this._router.navigateByUrl("/employee/create-test/compiler");
          this.compilerState.setCompilerTests([]);
          return of(null);
        }
        const modifiedTest = tests.data.map((test, index) =>
          new CompilerTest(test)
            .setIndex(index)
            .setCurrentExample(test.codeExample)
            .setPosition(index, tests.data.length)
        );
        const combinedTestTime = this.calcCombinedTestTime(modifiedTest);
        this.compilerState.setCompilerTests(modifiedTest);
        if (modifiedTest.length > 0) {
          this.compilerState.setSelectedTest(modifiedTest[0]);
        }
        this.compilerState.setCompilerTestSettings({
          dateTimeTestStarted: new Date(),
          combinedTestTime: combinedTestTime,
        });
        return this.initCompilerTestsDB(modifiedTest, combinedTestTime);
      })
    );
  }

  public setAllTestsAndSettingsInState$(tests: ICompilerTestsDb): Observable<null> {
    return of(null).pipe(
      takeUntil(this.ngUnsubscribe),
      tap(() => {
        this.compilerState.setCompilerTests(tests.data.map((test) => new CompilerTest(test)));
        if (tests.data.length > 0) {
          this.compilerState.setSelectedTest(tests.data[0]);
        }
        this.compilerState.setCompilerTestSettings(tests.settings);
      })
    );
  }

  public updateTestsInDb$(): Observable<ICompilerTestsDb> {
    return this.getCompilerTests$().pipe(
      skip(1),
      takeUntil(this.ngUnsubscribe),
      switchMap((tests) =>
        this.indexedDb.getByIndex<ICompilerTestsDb>("compilerTests", "id", 1).pipe(
          takeUntil(this.ngUnsubscribe),
          switchMap((testsInDb) => {
            if (tests.length) {
              return this.indexedDb.update("compilerTests", {
                ...testsInDb,
                data: tests,
              });
            } else {
              return of(testsInDb);
            }
          })
        )
      )
    );
  }

  public applyCurrentTest$(): Observable<void> {
    return this.compilerState.getSelectedTest$().pipe(
      take(1),
      takeUntil(this.ngUnsubscribe),
      switchMap((currentTest) => {
        if (!currentTest) {
          return of();
        }
        return this.compilerService.applyTestById(btoa(currentTest?.currentExample), currentTest?.uuid).pipe(
          take(1),
          takeUntil(this.ngUnsubscribe),
          switchMap((result) => {
            if (currentTest) {
              currentTest = new CompilerTest(currentTest).setResult(result);
            }
            return this.getCompilerTests$().pipe(
              take(1),
              takeUntil(this.ngUnsubscribe),
              switchMap((stateTests) => {
                stateTests = stateTests.map((test) => {
                  if (test.uuid === currentTest?.uuid) {
                    return currentTest;
                  }
                  return test;
                });
                this.compilerState.setCompilerTests(stateTests);
                this.compilerState.setSelectedTest(currentTest);
                return this.updateTestsInDb$().pipe(takeUntil(this.ngUnsubscribe),map(() => {}));
              })
            );
          })
        );
      })
    );
  }

  public applyAllTests$(): Observable<boolean> {
    return this.compilerState.getCompilerTests$().pipe(
      take(1),
      takeUntil(this.ngUnsubscribe),
      switchMap((tests) => {
        const requestParams = {
          tests: tests.map((test) => ({
            code: test.currentExample,
            testingTaskUuid: test.uuid,
          })),
        };
        return this.compilerService.applyAllTests(requestParams);
      })
    );
  }

  public clearCompilerTestsIndexDb$(): Observable<boolean> {
    this.compilerState.setCompilerTests([]);
    this.compilerState.setSelectedTest(null);
    this.compilerState.setCompilerTestSettings(null);
    return this.indexedDb.clear("compilerTests").pipe(tap(console.log));
  }

  // State getters
  public getCompilerTestSettings$(): Observable<ICompilerTestSettings | null> {
    return this.compilerState.getCompilerTestSettings$();
  }

  public getSelectedTest$(): Observable<CompilerTest | null> {
    return this.compilerState.getSelectedTest$();
  }

  public getCompilerTests$(): Observable<CompilerTest[]> {
    return this.compilerState.getCompilerTests$();
  }

  public getShouldDeactivate(): boolean {
    return this.compilerState.getShouldDeactivate();
  }

  // State setters
  public setSelectedTest(selectedTest: CompilerTest | null): void {
    return this.compilerState.setSelectedTest(selectedTest);
  }

  public setShouldDeactivate(value: boolean) {
    this.compilerState.setShouldDeactivate(value);
  }

  private initCompilerTestsDB(tests: CompilerTest[], time: number): Observable<null> {
    return this.indexedDb.clear("compilerTests").pipe(
      takeUntil(this.ngUnsubscribe),
      map((success) => {
        console.log("here", success);

        if (!success) {
          return throwError(() => "Store not cleared");
        }
        return success;
      }),
      retry(5),
      switchMap(() =>
        this.indexedDb
          .add<ICompilerTestsDb>("compilerTests", {
            data: tests,
            settings: {
              dateTimeTestStarted: new Date(),
              combinedTestTime: time,
            },
            id: 1,
          })
          .pipe(map(() => null))
      )
    );
  }

  private calcCombinedTestTime(tests: CompilerTest[]): number {
    const times = tests.map((test) => test.time);
    return times.length ? times.reduce((num1, num2) => num1 + num2) : 0;
  }
}
