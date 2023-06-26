import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map } from "rxjs";
import { CompilerTest } from "src/app/shared/interfaces/compiler-tests.interface";

@Injectable({
  providedIn: "root",
})
export class CompilerState {
  private _compilerTests$: BehaviorSubject<CompilerTest[]> = new BehaviorSubject<CompilerTest[]>([]);
  private _selectedTest$: BehaviorSubject<CompilerTest | null> = new BehaviorSubject<CompilerTest | null>(null);
  private _testsLenght$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _shouldDeactivate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public setShouldDeactivate(value: boolean) {
    this._shouldDeactivate$.next(value);
  }

  public getShouldDeactivate(): boolean {
    return this._shouldDeactivate$.value;
  }

  public getCompilerTests(): Observable<CompilerTest[]> {
    return this._compilerTests$;
  }

  public setCompilerTests(value: CompilerTest[]) {
    this._compilerTests$.next(value);
    this._testsLenght$.next(value.length);
  }

  public getTestsLength(): Observable<number> {
    return this._testsLenght$;
  }

  public getSelectedTest(): Observable<CompilerTest | null> {
    return this._selectedTest$;
  }

  public setCompilerTestByIndex(index: number): Observable<void> {
    return this._compilerTests$.pipe(
      map((tests) => tests.filter((test) => test.index === index)),
      map((test) => {
        if (test.length) {
          this._selectedTest$.next(test[0]);
        } else {
          this._selectedTest$.next(null);
        }
      })
    );
  }
}
