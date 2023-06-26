import {ChangeDetectorRef, Component, OnDestroy, OnInit, } from "@angular/core";
import {Router} from "@angular/router";
import {Unsubscribe} from "../../../shared-modules/unsubscriber/unsubscribe";
import {BehaviorSubject, filter, map, Observable, of, takeUntil} from "rxjs";
import {IEmployee} from "../../../root-modules/app/interfaces/employee.interface";
import {TestInterfaceQuiz, TestItemInterfaceQuiz} from "../enum/test-item.interface";
import {SearchParams} from "../../employee-info/interface/search-params";
import {TestLevelEnum} from "../enum/test-level.enum";
import {LocalStorageService} from "../../../root-modules/app/services/local-storage.service";
import {EmployeeInfoFacade} from "../../profile/components/utils/employee-info.facade";
import {RobotHelperService} from "../../../root-modules/app/services/robot-helper.service";
import {CreateTestService} from "../create-test-service/create-test-service";
import {specialistPosition} from "../../employee-info/mock/specialist-mock";
import {QuizState} from "../quiz/quiz.state";
import {CompilerState} from "../compiler/compiler.state";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { IQuizTestAnswers, IQuizTestResponse } from "src/app/shared/interfaces/quiz-tests.interface";


@Component({
  selector: "app-tests",
  templateUrl: "./tests-quiz.component.html",
  styleUrls: ["./tests-quiz.component.scss"]
})
export class TestsQuizComponent extends Unsubscribe implements OnInit, OnDestroy {
  private limit: number = 12;
  public employee$!: Observable<IEmployee>;
  public getTestItem!: Observable<TestItemInterfaceQuiz[]>;
  public specialistPosition!: string;
  public positionEnum = TestLevelEnum;
  public searchParams: SearchParams = {
    take: 12,
    skip: 0,
  };
  public testsCount!: number;
  public currentPage: number = 1;
  public isModalOpen: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public testItem: TestItemInterfaceQuiz | null = null;

  constructor(
    private readonly _localStorage: LocalStorageService,
    private readonly _employeeFacade: EmployeeInfoFacade,
    private readonly _robotHelperService: RobotHelperService,
    private readonly createTest: CreateTestService,
    private readonly router: Router,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _quizState: QuizState,
    private readonly _compilerState: CompilerState,
    private readonly indexedDb: NgxIndexedDBService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.clearQuizTestsIndexDb().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    this.isRobot();
    this.getSpecialistDefaultPosition();
  }

  public clearQuizTestsIndexDb(): Observable<boolean> {
    return this.indexedDb.clear("quizTests");
  }

  public opentStartTestsModal(item: TestItemInterfaceQuiz) {
    this.testItem = item;
    this.isModalOpen.next(true);
  }

  public confirmStartTest(action: boolean): void {
    if(!this.testItem){
      return;
    }
    this.modalToggle(false);
    if (action) {
      this._quizState.setShouldDeactivate(false);
      this._compilerState.setShouldDeactivate(false);
      let queryParams = {};
      localStorage.setItem("isInTests", "true");
      this.testItem.questions.forEach((question: IQuizTestResponse) => {
        question.answers.forEach((answer: IQuizTestAnswers) => {
          answer.is_selected = false;
        })
      });
      this._quizState.setSelectedQuizTest(this.testItem.questions);
      queryParams = {
        displayLanguage: this.testItem.name,
        fullRemainingTime: this.testItem.taskFullTime || 600000,
        fullRemainingFixedTime: this.testItem.taskFullTime || 600000,
      };
      this.router.navigate([`/employee/create-test/quiz-test`], {
        queryParams: queryParams
      });
    } else {
      this.testItem = null;
    }
  }

  public modalToggle(val?: boolean) {
    this.isModalOpen.next(val !== undefined ? val : !this.isModalOpen);
  }

  public getSpecialistDefaultPosition() {
    this._employeeFacade.getEmployee$().pipe(takeUntil(this.ngUnsubscribe)).subscribe((specialist) => {
      specialistPosition.map((position) => {
        if (position.displayName === specialist?.position) {
          this.specialistPosition = position?.value;
          this.searchParams.programmingLanguages = JSON.parse(specialist?.languagesFrameworksForSelect).languages
            .map((item: { value: string; }) => {
              return item.value;
            });
        }
      });
      this.getSelectedPaginationValue(1);
    });
  }

  public getTest(position: string, searchValue?: SearchParams): Observable<TestInterfaceQuiz | null> {
    if (this.specialistPosition) {
      this.getTestItem = this.createTest.getSpecialistQuizTest(this.specialistPosition, searchValue)
        .pipe(map((tests) => {
          this.testsPagesCount(tests.count);
          return tests.tests;
        }));
      this._cdr.detectChanges();
    }
    return of(null);
  }

  public isRobot(): void {
    if (this._localStorage.getItem("resume")) {
      this.employee$ = of(JSON.parse(this._localStorage.getItem("resume")));
    }
    this.employee$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter(data => !!data?.phone))
      .subscribe(data => {
        const currentPage = data.robot_helper?.find(((item: { link: string; }) =>
          item.link === "/employee/create-test"));

        if (currentPage && !currentPage?.hidden) {
          this._robotHelperService.setRobotSettings({
            content: "Create-tests",
            navigationItemId: null,
            isContentActive: true,
            uuid: currentPage?.uuid,
          });
          this._robotHelperService.isRobotOpen$.next(true);
          return;
        }
        this._robotHelperService.setRobotSettings({
          content: "Create-tests - helper text",
          navigationItemId: null,
          isContentActive: true,
        });
      });
  }

  public convertTaskFullTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor(milliseconds / 1000);
    let time;
    if (hours === 0 && minutes > 0) {
      time = `${minutes}:${seconds} м`;
    } else if (hours === 0 && minutes === 0) {
      time = `${seconds} с`;
    } else if (hours > 0) {
      time = `${hours} :${minutes}:${seconds} ч.`;
    }
    // @ts-ignore
    return time;
  }

  public searchDate(searchList: any) {
    if (searchList.hasOwnProperty("position")) {
      if (searchList.position) {
        this.specialistPosition = searchList.position;
        this.searchParams.position = this.specialistPosition;
      } else {
        delete this.searchParams.position;
      }
    }
    if (searchList.hasOwnProperty("programmingLanguages")) {
      if (searchList.programmingLanguages?.length > 0) {
        this.searchParams.programmingLanguages = searchList.programmingLanguages;
      } else {
        delete this.searchParams.programmingLanguages;
      }
    }
    if (searchList.hasOwnProperty("languageUuids")) {
      if (searchList.languageUuids?.length > 0) {
        this.searchParams.languageUuids = searchList.languageUuids;
      } else {
        delete this.searchParams.languageUuids;
      }
    }
    this.getTest(searchList.position, this.searchParams);
  }

  private testsPagesCount(count: number): void {
    this.testsCount = Math.ceil(count / this.limit);
  }

  public getSelectedPaginationValue(pageNumber: number) {
    this.searchParams.skip = (pageNumber - 1) * this.limit;
    this.searchParams.take = 12;
    this.getTest(this.specialistPosition, this.searchParams);
  }

  public changeSpecialistPosition(chnagedPosition: string): string {
    const getPosition = specialistPosition.find((position: { value: string; }) => position.value === chnagedPosition);
    return getPosition ? getPosition.displayName : "";
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
