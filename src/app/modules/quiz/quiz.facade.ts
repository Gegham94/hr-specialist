import { Injectable } from "@angular/core";
import { QuizState } from "./quiz.state";
import { Observable, map, of, switchMap } from "rxjs";
import { IQuizTestResponse, IQuizTestResponseDto, IQuizTestResponseSettings } from "src/app/shared/interfaces/quiz-tests.interface";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { QuizService } from "./quiz-service.service";

@Injectable({
  providedIn: "root",
})
export class QuizFacade {
  constructor(
    private _quizState: QuizState,
    private _quizService: QuizService,
    private readonly indexedDb: NgxIndexedDBService
  ) {}

  public sendTests(tests: IQuizTestResponse[]): Observable<IQuizTestResponse[]> {
    return this._quizService.applyTests(tests).pipe(
      map((output) => {
        return output;
      })
    );
  }

  private initQuizTestsDB(): Observable<{
    data: IQuizTestResponse[];
    settings: IQuizTestResponseSettings;
    id: number;
  } | null> {
    return this.indexedDb
      .getByIndex<{ data: IQuizTestResponse[]; settings: IQuizTestResponseSettings; id: number }>("quizTests", "id", 1)
      .pipe(
        switchMap((res) => {
          if (res) {
            return of(res);
          } else {
            this.indexedDb.add<{ data: IQuizTestResponse[]; settings: IQuizTestResponseSettings; id: number }>(
              "quizTests",
              {
                data: [],
                settings: {
                  displayTestName: "",
                  remainingTime: "",
                  remainingFixedTime: "",
                },
                id: 1,
              }
            );
            return of(null);
          }
        })
      );
  }

  // State setters
  public setTests(
    displayTestName: string,
    remainingTime: string,
    remainingFixedTime: string,
    selectedTestQuestions: IQuizTestResponse[]
  ): Observable<{ data: IQuizTestResponse[]; settings: IQuizTestResponseSettings; id: number } | null> {
    return this.initQuizTestsDB().pipe(
      switchMap((testsFromDB) => {
        if (!testsFromDB || testsFromDB === null) {
          this._quizState.setQuizTests(selectedTestQuestions);
          return this.indexedDb.update<{ data: IQuizTestResponse[]; settings: IQuizTestResponseSettings; id: 1 }>(
            "quizTests",
            {
              data: selectedTestQuestions,
              settings: {
                displayTestName,
                remainingTime,
                remainingFixedTime,
              },
              id: 1,
            }
          );
        } else {
          this._quizState.setQuizTests(testsFromDB.data);
          return this.indexedDb.update<{ data: IQuizTestResponse[]; settings: IQuizTestResponseSettings; id: 1 }>(
            "quizTests",
            {
              data: testsFromDB.data,
              settings: {
                displayTestName: testsFromDB.settings.displayTestName,
                remainingTime: testsFromDB.settings.remainingTime,
                remainingFixedTime: testsFromDB.settings.remainingFixedTime,
              },
              id: 1,
            }
          );
        }
      })
    );
  }

  public setSelectedQuizTest(questions: IQuizTestResponse[]): void {
    this._quizState.setSelectedQuizTest(questions);
  }

  public setShouldDeactivate(value: boolean) {
    this._quizState.setShouldDeactivate(value);
  }

  public getShouldDeactivate(): boolean {
    return this._quizState.getShouldDeactivate();
  }
}
