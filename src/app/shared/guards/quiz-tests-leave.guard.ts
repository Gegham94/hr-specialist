import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { QuizState } from '../../modules/quiz/quiz.state';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class QuizTestsLeaveGuard implements CanDeactivate<CanComponentDeactivate> {

  private shouldDeactivate: boolean = true;

  constructor (private readonly _quizState: QuizState) { }

  canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {
    this.shouldDeactivate = this._quizState.getShouldDeactivate();
    if (this.shouldDeactivate){
      return this.shouldDeactivate;
    } else {
      return component.canDeactivate()
    }
  }
}
