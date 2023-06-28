import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {TestLevel, TestLevelEnum} from "../constants/tests-level.enum";
import {LocalStorageService} from "../../../shared/services/local-storage.service";
import {ObjectType} from "../../../shared/types/object.type";
import {TestCategory} from "../constants/tests.enum";
import { TestItemInterface } from "../../create-test/enum/test-item.interface";

@Component({
  selector: "app-tests-list",
  templateUrl: "./tests-list.component.html",
  styleUrls: ["./tests-list.component.scss"]
})
export class TestsListComponent {
  public readonly TestLevelEnum = TestLevelEnum;
  public readonly TestLevel = TestLevel;
  public uuid!: string;

  public groupByCategoryOfPsychological = {};
  public groupByCategoryOfProgramming = {};
  public tests = {};

  constructor(
    private readonly _localStorage: LocalStorageService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
  ) {
    this.uuid = this._route.snapshot.queryParams?.["uuid"];
  }

  ngOnInit() {
    this.getTests();
  }

  private getTests(): any {
    const data = JSON.parse(this._localStorage.getItem("selectedGroupTests"));

    this.groupByCategoryOfPsychological =
      data.reduce((group: ObjectType, product: ObjectType) => {
        const {interviewTest} = product;
        const {typeOfQuiz} = product;
        if (interviewTest?.specialist_skill_type?.name && typeOfQuiz === TestCategory.psychological) {
          group[interviewTest?.specialist_skill_type?.name] =
            group[interviewTest?.specialist_skill_type?.name] ?? [];

          group[interviewTest?.specialist_skill_type?.name] = [];
          group[interviewTest?.specialist_skill_type?.name].push(product);
        }
        return group;
      }, []);

    this.groupByCategoryOfProgramming = data.reduce((group: ObjectType, product: ObjectType) => {
      const {interviewTest} = product;
      const {typeOfQuiz} = product;
      if (interviewTest?.specialist_skill_type?.name && typeOfQuiz === TestCategory.programming) {
        group[interviewTest?.specialist_skill_type?.name] =
          group[interviewTest?.specialist_skill_type?.name] ?? [];
        group[interviewTest?.specialist_skill_type?.name].push(product);
      }
      return group;
    }, []);

    if (this.isObjectData(this.groupByCategoryOfProgramming)) {
      this.tests = this.groupByCategoryOfProgramming;
    } else if (this.isObjectData(this.groupByCategoryOfPsychological)) {
      this.tests = this.groupByCategoryOfPsychological;
    } else {
      this.tests = {};
    }
  }

  public isObjectData(object: ObjectType): boolean {
    return Object.keys(object).length !== 0;
  }

  public getDate(date: string): Date {
    return new Date(date);
  }

  public openSpecialistTest(testUuid?: string): void {
    // Todo: uuid: this.uuid
    this._router.navigate([`/employee/analytics/tests/test`], {
      queryParams: {
        testId: testUuid,
        uuid: "1e8dfe58-2f9e-48c9-bc02-d9c7661f3878"
      }
    });
  }
}
