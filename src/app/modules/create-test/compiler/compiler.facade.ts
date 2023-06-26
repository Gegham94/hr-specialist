import { Injectable } from "@angular/core";
import { CompilerService } from "./compiler-service.service";
import { Observable, map, of, switchMap, take } from "rxjs";
import { CompilerState } from "./compiler.state";
import { CompilerTest, ICompilerTestOutput, ICompilerTestRequest, ICompilerTestResponseSettings } from "../../../shared/interfaces/compiler-tests.interface";
import { NgxIndexedDBService } from "ngx-indexed-db";

@Injectable({
  providedIn: "root",
})
export class CompilerFacade {

  constructor(
    private compilerService: CompilerService,
    private compilerState: CompilerState,
    private readonly indexedDb: NgxIndexedDBService,
  ) {}

  public setTestsById(
    testUuid: string,
    displayTestName: string,
    remainingTime: string,
    remainingFixedTime: string,
    testsLengthCounter: number,
  ): Observable<{ data: CompilerTest[]; settings: ICompilerTestResponseSettings; id: number } | null> {
    return this.initCompilerTestsDB().pipe(
      switchMap((testsFromDB) => {
        if (!testsFromDB || testsFromDB === null) {
          return this.compilerService.getTestsById(testUuid).pipe(
            switchMap((tests) => {
              if (!tests) {
                return of(null);
              }
              const modifiedTest = tests.data.map((test, index) =>
                new CompilerTest(test).setIndex(index).setCurrentExample(test.codeExample).setTestSuccess(null)
              );
              this.compilerState.setCompilerTests(modifiedTest);
              return this.indexedDb.update<{ data: CompilerTest[]; settings: ICompilerTestResponseSettings; id: 1 }>("compilerTests", {
                data: modifiedTest,
                settings: {
                  displayTestName,
                  remainingTime,
                  remainingFixedTime,
                  testsLengthCounter,
                },
                id: 1,
              });
            })
          );
        } else {
          const modifiedTest = testsFromDB.data.map((test, index) =>
            new CompilerTest(test).setIndex(index).setCurrentExample(test.currentExample).setTestSuccess(test.success)
          );
          this.compilerState.setCompilerTests(modifiedTest);
          return this.indexedDb.update<{ data: CompilerTest[]; settings: ICompilerTestResponseSettings; id: 1 }>("compilerTests", {
            data: modifiedTest,
            settings: {
              displayTestName: testsFromDB.settings.displayTestName,
              remainingTime: testsFromDB.settings.remainingTime,
              remainingFixedTime: testsFromDB.settings.remainingFixedTime,
              testsLengthCounter: testsFromDB.settings.testsLengthCounter,
            },
            id: 1,
          });
        }
      })
    );
  }

  public applyTestbyId(code: string, testUuid: string): Observable<ICompilerTestOutput> {
    return this.compilerService.applyTestbyId(code, testUuid).pipe(
      map((output) => {
        return output;
      })
    );
  }

  public sendApplyAllTests(tests: ICompilerTestRequest): Observable<ICompilerTestOutput> {
    return this.compilerService.applyAllTests(tests).pipe(
      map((output) => {
        return output;
      })
    );
  }

  private initCompilerTestsDB(): Observable<{ data: CompilerTest[]; settings: ICompilerTestResponseSettings; id: number } | null> {
    return this.indexedDb.getByIndex<{ data: CompilerTest[]; settings: ICompilerTestResponseSettings; id: number }>("compilerTests", "id", 1).pipe(
      switchMap((res) => {
        if (res) {
          return of(res);
        } else {
          this.indexedDb.add<{ data: CompilerTest[]; settings: ICompilerTestResponseSettings; id: number }>("compilerTests", {
            data: [],
            settings: {
              displayTestName: '',
              remainingTime: '',
              remainingFixedTime: '',
              testsLengthCounter: 0,
            },
            id: 1,
          });
          return of(null);
        }
      })
    );
  }
}
