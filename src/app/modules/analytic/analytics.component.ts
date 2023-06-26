import {ChangeDetectorRef, Component, OnDestroy, OnInit,} from "@angular/core";
import {EChartsOption} from "echarts/types/dist/echarts";
import {BehaviorSubject, filter, map, Observable, of, takeUntil} from "rxjs";
import {Unsubscribe} from "../../shared-modules/unsubscriber/unsubscribe";
import {LocalStorageService} from "../../root-modules/app/services/local-storage.service";
import {RobotHelperService} from "../../root-modules/app/services/robot-helper.service";
import {IEmployee} from "../../root-modules/app/interfaces/employee.interface";
import {AnalyticsEnum} from "./constants/analytics.enum";
import {QuestionsAnswersInterface, SpecialistListsInterface, Tests} from "./interfaces/tests.interface";
import {ObjectType} from "../../shared-modules/types/object.type";
import {AnalyticService} from "./analytic.service";
import {Router} from "@angular/router";

@Component({
  selector: "hr-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.scss"],
})
export class AnalyticsComponent extends Unsubscribe implements OnInit, OnDestroy {
  public option!: EChartsOption;
  public employee$!: Observable<IEmployee>;

  public specialistList$: BehaviorSubject<SpecialistListsInterface | null> =
    new BehaviorSubject<SpecialistListsInterface | null>(null);

  public questionAnswers$!: Observable<QuestionsAnswersInterface[]>;

  public passedTestsPercentages: BehaviorSubject<Tests> =
    new BehaviorSubject<Tests>({
      interview: {
        point: "0",
        testsCount: 0,
      },
      programming: {
        point: "0",
        testsCount: 0,
      },
      psychologic: {
        point: "0",
        testsCount: 0,
      },
    });

  public readonly AnalyticsEnum = AnalyticsEnum;
  public groupByTypeOfQuiz: ObjectType = {};


  constructor(
    private _localStorage: LocalStorageService,
    private _robotHelperService: RobotHelperService,
    private _analyticService: AnalyticService,
    private _router: Router,
    private _cdr: ChangeDetectorRef,
  ) {
    super();
  }

  public getSpecialistCard() {

    // Todo: specialist.uuid
    this._analyticService.getSpecialistCard("1e8dfe58-2f9e-48c9-bc02-d9c7661f3878")
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((spec) => !!spec.specialist),
        map((spec) => spec.specialist),
        map((spec) => {
          this.specialistList$.next(spec);
          const questionAnswers = spec.test_answers.map((specialistTestList: any) =>
            ({
              point: specialistTestList?.point,
              correctAnswerCount: specialistTestList?.correctAnswerCount,
              wrongAnswerCount: specialistTestList?.wrongAnswerCount,
              typeOfQuiz: specialistTestList?.interview_test?.["typeOfQuiz"],
              testUuid: specialistTestList?.questionAnswerList.testUuid,
              title: specialistTestList?.questionAnswerList.title,
              interviewTest: specialistTestList?.interview_test,
              categoryType: specialistTestList?.interview_test?.["specialist_skill_type"]?.name
            }));

          const quizzes = {
            interview: {
              point: "0",
              testsCount: 0,
            },
            programming: {
              point: "0",
              testsCount: 0,
            },
            psychologic: {
              point: "0",
              testsCount: 0,
            },
          };

          this.groupByTypeOfQuiz = questionAnswers.reduce((group: ObjectType, product: ObjectType) => {
            const {typeOfQuiz, point} = product;
            if (typeOfQuiz && point) {
              group[typeOfQuiz] = group[typeOfQuiz] ?? [];
              quizzes[typeOfQuiz].point = +quizzes[typeOfQuiz].point + (+(product?.["point"]));
              quizzes[typeOfQuiz].testsCount += 1;

              group[typeOfQuiz].push(product);
            }
            return group;
          }, {});

          quizzes["interview"].point = quizzes["interview"].testsCount ? quizzes["interview"].point : "0";

          quizzes["psychologic"].point = quizzes["psychologic"].testsCount ? quizzes["psychologic"].point : "0";

          quizzes["programming"].point = quizzes["programming"].testsCount ? quizzes["programming"].point : "0";

          this.passedTestsPercentages.next(quizzes);
          this.getOptions();
          this._cdr.detectChanges();

          return questionAnswers;
        }),
      )
      .subscribe();
  }

  public ngOnInit(): void {
    this.isRobot();
    this.getOptions();
    this.getSpecialistCard();
  }

  public openTestsList(type: string) {
    const employee = JSON.parse(this._localStorage.getItem("resume"));
    this._localStorage.setItem("selectedGroupTests", JSON.stringify(this.groupByTypeOfQuiz[type]));
    this._router.navigate([`employee/analytics/tests`], {queryParams: {uuid: employee.uuid}});
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
          item.link === "/employee/analytics"));

        // const currentPageStep2 = data.robot_helper?.find(((item: { link: string; }) =>
        //   item.link === "/employee/analytics-2"));


        this._robotHelperService.setRobotSettings({
          content: "Analytics - helper",
          navigationItemId: null,
          isContentActive: true,
        });

        if (currentPage && !currentPage?.hidden) {
          this._robotHelperService.setRobotSettings({
            content: "Analytics",
            navigationItemId: null,
            isContentActive: true,
            uuid: currentPage?.uuid,
            // showSecondRobot: {
            //   content: "Analytics - step 2",
            //   navigationItemId: 4,
            //   isContentActive: true,
            //   uuid: currentPageStep2?.uuid,
            //   activeContentLink: "/employee/chat/isActive"
            // },
          });
          this._robotHelperService.isRobotOpen$.next(true);
        }
      });
  }

  public get allTestsCount(): number {
    let sum = 0;
    // tslint:disable-next-line:forin
    for (const key in this.passedTestsPercentages.value) {
      sum += this.passedTestsPercentages.value[key].testsCount;
    }
    return sum;
  }

  public get chartPercentages(): number[] {
    let sumPercentages = 0;
    const chartPercentages = [];
    // tslint:disable-next-line:forin
    for (const key in this.passedTestsPercentages.value) {
      sumPercentages += +(this.passedTestsPercentages.value[key].point);
    }
    // tslint:disable-next-line:forin
    for (const key in this.passedTestsPercentages.value) {
      chartPercentages.push(+((this.passedTestsPercentages.value[key].point * 100) / sumPercentages).toFixed(2));
    }
    return chartPercentages;
  }

  private getOptions(): void {
    this.option = {
        tooltip: {
          trigger: "item",
          formatter: (param: any) => {
            return ` <span style="display:inline-block;
                      margin-left:5px;border-radius:10px;
                      width:9px;height:9px;
                      background-color:${param.color};"></span>
                      ${param.seriesName} - ${param.value} %`
          }
        },
      xAxis: {
        data: ['Собеседование', 'Тест компилятора', 'Теоретически тест'],
     },
     yAxis: {
      type: 'value',
     },
     legend: {
      data: ['Проваленные вопросы']
    },
    title: {
      subtext: "в процентах"
    },
      series: [
        {
          name: 'Пройденные тесты',
          type: 'bar',
          stack: 'total',
          label: {
            show: true
          },
          emphasis: {
            focus: 'series'
          },
          data: [40, 30, 50],
            itemStyle: {
                color: function(params) {
                  let colorList = ['#33bb47', '#008FFB', '#FF4560'];
                  return colorList[params.dataIndex];
                }
              }

        },
        {
          name: 'Проваленные вопросы',
          type: 'bar',
          stack: 'total',
          label: {
            show: true
          },
           color: ['#b8b8b8'],

          emphasis: {
            focus: 'series'
          },
          data: [60, 70, 50]
        },
      ],
      animation: true,
    };
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

}
