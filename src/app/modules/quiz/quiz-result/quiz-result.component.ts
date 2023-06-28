import { Component, OnDestroy, OnInit } from '@angular/core';
import { Unsubscribe } from "../../../shared/unsubscriber/unsubscribe";
import { Observable } from 'rxjs';
import { IQuizTestResponse } from 'src/app/shared/interfaces/quiz-tests.interface';
import { QuizState } from '../quiz.state';

@Component({
  selector: 'hr-quiz-result',
  templateUrl: './quiz-result.component.html',
  styleUrls: ['./quiz-result.component.scss']
})
export class QuizResultComponent extends Unsubscribe implements OnInit, OnDestroy {
  
  public quizTests$: Observable<IQuizTestResponse[] | null> = this._quizState.getSelectedQuizTest();
  
  constructor(
    private _quizState: QuizState,
  ) {
    super();
  }

  public ngOnInit() { }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
