import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import { Unsubscribe } from "../../../shared-modules/unsubscriber/unsubscribe";
import { ActivatedRoute } from "@angular/router";
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
  interval,
} from "rxjs";
import { CanComponentDeactivate } from "../../../shared/guards/quiz-tests-leave.guard";
import { QuizState } from "./quiz.state";
import { IQuizTestResponse, IQuizTestResponseSettings } from "src/app/shared/interfaces/quiz-tests.interface";
import { QuizFacade } from "./quiz.facade";
import { NgxIndexedDBService } from "ngx-indexed-db";

@Component({
  selector: "hr-quiz",
  templateUrl: "./quiz.component.html",
  styleUrls: ["./quiz.component.scss"],
})
export class QuizComponent extends Unsubscribe implements OnInit, OnDestroy, CanComponentDeactivate {
  public isShowResultPage: boolean = false;
  public isShowResultBtn: boolean = false;
  public isShowSubmitBtn: boolean = false;
  public isOptionsDisabled: boolean = false;

  public isModalOpenFail: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isModalOpenTimeOver: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public startTestNotifier$: Subject<void> = new Subject<void>();
  public clickNotifier$: Subject<void> = new Subject<void>();
  public navigationStatus$: Subject<boolean> = new Subject<boolean>();

  public displayTestName = this._activatedRoute.snapshot.queryParams["displayLanguage"];
  public remainingTime = this._activatedRoute.snapshot.queryParams["fullRemainingTime"];
  public remainingFixedTime = this._activatedRoute.snapshot.queryParams["fullRemainingFixedTime"];
  public quizTests$: Observable<IQuizTestResponse[] | null> = this._quizState.getQuizTests();
  public quizSelectedTest$: Observable<IQuizTestResponse[] | null> = this._quizState.getSelectedQuizTest();

  private timerStartCount: number = 0;
  private timerStartCountFixed: number = 0;
  private stopTimer$ = new Subject<void>();

  public displayRemainingFixedTime: Date = new Date(new Date().setHours(0, 0, 0, parseInt(this.remainingFixedTime)));

  public currentPage: number = 1;
  public totalPages: number = 0;

  constructor(
    private _quizFacade: QuizFacade,
    private _activatedRoute: ActivatedRoute,
    private _quizState: QuizState,
    private _cdr: ChangeDetectorRef,
    private readonly indexedDb: NgxIndexedDBService,
    private datePipe: DatePipe
  ) {
    super();
  }

  public ngOnInit() {
    this._quizState
      .getSelectedQuizTest()
      .pipe(
        switchMap((selectedQuiz) => {
          if (!selectedQuiz) {
            return this.indexedDb.getByIndex<{ data: IQuizTestResponse[]; settings: IQuizTestResponseSettings; id: number }>("quizTests", "id", 1).pipe(
              takeUntil(this.ngUnsubscribe),
              switchMap((res) => {
                if (!res) {
                  return of(null);
                }
                  this.timerStartCount = res.settings.remainingTime ? parseInt(res.settings.remainingTime) : 0;
                  this.timerStartCountFixed = res.settings.remainingFixedTime ? parseInt(res.settings.remainingFixedTime) : 0;
                  return of(res);
              }),
              switchMap(() => {
                return this.getTimer(this.timerStartCount);
              })
            );
          }
          return this._quizFacade
            .setTests(this.displayTestName, this.remainingTime, this.remainingFixedTime, selectedQuiz)
            .pipe(
              takeUntil(this.ngUnsubscribe),
              tap((res) => {
                if (res) {
                  this.timerStartCount = res.settings.remainingTime ? parseInt(res.settings.remainingTime) : 0;
                  this.timerStartCountFixed = res.settings.remainingFixedTime ? parseInt(res.settings.remainingFixedTime) : 0;
                }
              }),
              switchMap(() => {
                return this.getTimer(this.timerStartCount);
              })
            );
        })
      )
      .subscribe();
    this.calculateTotalPages();
    this._cdr.detectChanges();
  }

  private updateQuizTestsIndexDb() {
    return this.quizSelectedTest$.pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap((tests) => {
        if (tests) {
          return this.indexedDb.update<{
            data: IQuizTestResponse[] | null;
            settings: IQuizTestResponseSettings;
            id: 1;
          }>("quizTests", {
            data: tests,
            id: 1,
            settings: {
              displayTestName: this.displayTestName,
              remainingTime: this.remainingTime,
              remainingFixedTime: this.remainingFixedTime,
            },
          });
        } else {
          return of(null);
        }
      })
    );
  }

  public clearQuizTestsIndexDb(): Observable<boolean> {
    return this.indexedDb.clear("quizTests");
  }

  public onOptionSelect(questionUuid: string, answerId: string) {
    this.quizSelectedTest$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map((tests) => {
          if (tests) {
            for (const test of tests) {
              if (test.uuid === questionUuid) {
                for (const answer of test.answers) {
                  if (answer.id === answerId) {
                    answer.is_selected = true;
                  } else {
                    answer.is_selected = false;
                  }
                }
                break;
              }
            }
            this._quizState.setQuizTests(tests);
          }
        })
      ).subscribe();
  }

  public setSeconds(time: any) {
    let formattedTime: string | null;
    if (time >= 3600000) {
      formattedTime = this.datePipe.transform(time, "hh:mm:ss");
    } else {
      formattedTime = this.datePipe.transform(time, "mm:ss");
    }
    const elementOuter = document.querySelector(".seconds_outer") as HTMLDivElement;
    const elementInner = document.querySelector(".seconds_inner") as HTMLDivElement;
    elementInner!.textContent = formattedTime;
    elementOuter!.style.background = `conic-gradient(
      rgba(0, 148, 49, 0.9) 0deg,
      rgba(0, 201, 43, 0.9) ${this.countDegs(time, this.timerStartCountFixed)}deg,
      transparent 0deg
    )`;
  }

  public countDegs(timeValue: any, total: any) {
    const degs = 365;
    const percentage = Math.round((timeValue * 100) / total);
    const degsOffset = (degs * percentage) / 100;
    return Math.floor(degsOffset);
  }

  public getTimer(time: number): Observable<IQuizTestResponse[] | null> {
    return interval(1000).pipe(
      takeUntil(this.stopTimer$),
      takeUntil(interval(time + 2000)),
      takeUntil(this.ngUnsubscribe),
      switchMap(() => {
        if (time <= 0) {
          return this.quizSelectedTest$.pipe(
            tap((tests) => {
              if (tests) {
                this.isShowResultBtn = true;
                this.isShowSubmitBtn = false;
                this.isOptionsDisabled = true;
                this._quizState.setShouldDeactivate(true);
                localStorage.removeItem("isInTests");
                this.modalToggleTimeOver(true);
                this.submitAnswers(tests);
              }
            })
          );
        } else {
          this.remainingTime = time -= 1000;
          this.setSeconds(this.remainingTime);
          return this.updateQuizTestsIndexDb().pipe(map((data) => null));
        }
      })
    );
  }

  public canDeactivate(): boolean | Observable<boolean> {
    this.modalToggleFail(true);
    return combineLatest([this.navigationStatus$, this.clickNotifier$]).pipe(map(([boolean, smth]) => boolean));
  }

  public sendAnswers() {
    this.quizSelectedTest$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap((tests) => {
          if (tests) {
            this.stopTimer$.next();
            this.stopTimer$.complete();
            this.isShowResultBtn = true;
            this.isShowSubmitBtn = false;
            this.isOptionsDisabled = true;
            this._quizState.setShouldDeactivate(true);
            localStorage.removeItem("isInTests");
            this.submitAnswers(tests);
          }
        })
      )
      .subscribe();
  }

  public confirmTimeOver() {
    this.modalToggleTimeOver(false);
  }

  public isCanNavigate(action: boolean) {
    if (action) {
      this.clearQuizTestsIndexDb()
        .pipe(
          takeUntil(this.ngUnsubscribe),
          switchMap(() => {
            this.stopTimer$.next();
            this.stopTimer$.complete();
            localStorage.removeItem("isInTests");
            this._quizState.setShouldDeactivate(true);
            this.clickNotifier$.next();
            this.navigationStatus$.next(true);
            this.modalToggleFail(false);
            return of(action);
          })
        )
        .subscribe();
    } else {
      this._quizState.setShouldDeactivate(false);
      this.modalToggleFail(false);
      this.clickNotifier$.next();
      this.navigationStatus$.next(false);
    }
  }

  public modalToggleTimeOver(val?: boolean) {
    this.isModalOpenTimeOver.next(val !== undefined ? val : !this.isModalOpenTimeOver);
    document.body.style.overflowY = "scroll";
  }

  public modalToggleFail(val?: boolean) {
    this.isModalOpenFail.next(val !== undefined ? val : !this.isModalOpenFail);
    document.body.style.overflowY = "scroll";
  }

  public calculateTotalPages(): void {
    const startIndex = (this.currentPage - 1) * 5;
    const endIndex = startIndex + 5;
    this.quizSelectedTest$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap((tests) => {
          if (tests) {
            this.totalPages = Math.ceil(tests.length / 5);
            tests.slice(startIndex, endIndex);
          }
        })
      )
      .subscribe();
    if (!this.isOptionsDisabled) {
      this.isShowSubmitBtn = this.currentPage >= this.totalPages ? true : false;
    }
  }

  public nextPage($element: HTMLElement): void {
    $element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    this.currentPage++;
    this.calculateTotalPages();
  }

  public prevPage($element: HTMLElement): void {
    $element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    this.currentPage--;
    this.calculateTotalPages();
  }

  public submitAnswers(tests: IQuizTestResponse[]): void {
    const elementInner = document.querySelector(".seconds_inner") as HTMLDivElement;
    elementInner!.textContent = "Конец";
    this._quizFacade
      .sendTests(tests)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((result) => {
          return this.quizSelectedTest$.pipe(
            tap((tests) => {
              if (tests) {
                tests = result;
                this._quizState.setSelectedQuizTest(tests);
                this.stopTimer$.next();
                this.stopTimer$.complete();
                this._quizState.setShouldDeactivate(true);
                this.clickNotifier$.next();
                this.navigationStatus$.next(true);
              }
            })
          );
        })
      )
      .subscribe();
    this._cdr.detectChanges();
  }

  public showResult(val: boolean = false): void {
    this.unsubscribe();
    this.isShowResultPage = !!val;
  }

  public ngOnDestroy(): void {
    this.stopTimer$.next();
    this.stopTimer$.complete();
    this.unsubscribe();
  }
}
