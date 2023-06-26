import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { CompilerState } from '../../modules/create-test/compiler/compiler.state';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CompilerTestsLeaveGuard implements CanDeactivate<CanComponentDeactivate> {

  private shouldDeactivate: boolean = false;

  constructor (
    private _compilerState: CompilerState
  ) { }

  canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {
    this.shouldDeactivate = this._compilerState.getShouldDeactivate();
    if (this.shouldDeactivate){
      return this.shouldDeactivate;
    } else {
      return component.canDeactivate()
    }
  }
}
