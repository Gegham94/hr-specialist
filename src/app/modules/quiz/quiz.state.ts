import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map } from "rxjs";
import { IQuizTestResponse } from "src/app/shared/interfaces/quiz-tests.interface";

@Injectable({
  providedIn: "root",
})
export class QuizState {
  private _quizTests$: BehaviorSubject<IQuizTestResponse[] | null> = new BehaviorSubject<IQuizTestResponse[] | null>(null);
  private _quizSelectedTest$: BehaviorSubject<IQuizTestResponse[] | null> = new BehaviorSubject<IQuizTestResponse[] | null>(null);
  private _shouldDeactivate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private _fullRemainingTime$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public setShouldDeactivate(value: boolean) {
    this._shouldDeactivate$.next(value);
  }

  public getShouldDeactivate(): boolean {
    return this._shouldDeactivate$.value;
  }

  public getQuizTests(): Observable<IQuizTestResponse[] | null> {
    return this._quizTests$;
  }

  public setQuizTests(value: IQuizTestResponse[]) {
    this._quizTests$.next(value);
  }

  public setSelectedQuizTest(value: IQuizTestResponse[]) {
    this._quizSelectedTest$.next(value);
  }

  public getSelectedQuizTest(): Observable<IQuizTestResponse[] | null> {
    return this._quizSelectedTest$;
  }

  public setFullRemainingTime(value: number) {
    this._fullRemainingTime$.next(value);
  }

  public getFullRemainingTime(): BehaviorSubject<number> {
    return this._fullRemainingTime$;
  }
  
}
