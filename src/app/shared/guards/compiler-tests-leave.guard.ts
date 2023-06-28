import { CanDeactivate } from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable, take } from "rxjs";

import { CompilerFacade } from "src/app/modules/compiler/services/compiler.facade";

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: "root",
})
export class CompilerTestsLeaveGuard implements CanDeactivate<CanComponentDeactivate> {
  private shouldDeactivate: boolean = true;

  constructor(private readonly _compilerFacade: CompilerFacade) {}

  canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {
    this.shouldDeactivate = this._compilerFacade.getShouldDeactivate();
    if (this.shouldDeactivate) {
      this._compilerFacade.clearCompilerTestsIndexDb$().pipe(take(1)).subscribe();
      return this.shouldDeactivate;
    } else {
      return component.canDeactivate();
    }
  }
}
