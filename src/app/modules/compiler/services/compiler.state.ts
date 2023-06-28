import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map } from "rxjs";
import { CompilerTest, ICompilerTestSettings } from "src/app/shared/interfaces/compiler-tests.interface";

@Injectable({
  providedIn: "root",
})
export class CompilerState {
  private _compilerTests$: BehaviorSubject<CompilerTest[]> = new BehaviorSubject<CompilerTest[]>([]);
  private _compilerTestSettings$: BehaviorSubject<ICompilerTestSettings | null> =
    new BehaviorSubject<ICompilerTestSettings | null>(null);
  private _selectedTest$: BehaviorSubject<CompilerTest | null> = new BehaviorSubject<CompilerTest | null>(null);

  private _shouldDeactivate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  public setShouldDeactivate(value: boolean) {
    this._shouldDeactivate$.next(value);
  }

  public getShouldDeactivate(): boolean {
    return this._shouldDeactivate$.value;
  }

  public setCompilerTests(value: CompilerTest[]): void {
    this._compilerTests$.next(value);
  }

  public getCompilerTests$(): Observable<CompilerTest[]> {
    return this._compilerTests$;
  }

  public setCompilerTestSettings(value: ICompilerTestSettings | null): void {
    this._compilerTestSettings$.next(value);
  }

  public getCompilerTestSettings$(): Observable<ICompilerTestSettings | null> {
    return this._compilerTestSettings$;
  }

  public setSelectedTest(selectedTest: CompilerTest | null): void {
    return this._selectedTest$.next(selectedTest);
  }

  public getSelectedTest$(): Observable<CompilerTest | null> {
    return this._selectedTest$;
  }
}
