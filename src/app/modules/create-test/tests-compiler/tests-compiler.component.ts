import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Unsubscribe } from "../../../shared/unsubscriber/unsubscribe";
import { BehaviorSubject, filter, map, Observable, of, takeUntil } from "rxjs";
import { IEmployee } from "../../../shared/interfaces/employee.interface";
import { TestInterface, TestItemInterface } from "../enum/test-item.interface";
import { TestLevelEnum } from "../enum/test-level.enum";
import { LocalStorageService } from "../../../shared/services/local-storage.service";
import { EmployeeInfoFacade } from "../../profile/services/employee-info.facade";
import { RobotHelperService } from "../../../shared/services/robot-helper.service";
import { specialistPosition } from "../../profile/mock/specialist-mock";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { CompilerFacade } from "../../compiler/services/compiler.facade";
import { SearchParams } from "../../profile/interfaces/search-params";
import { CreateTestFacade } from "../services/create-test.facade";

@Component({
  selector: "app-tests",
  templateUrl: "./tests-compiler.component.html",
  styleUrls: ["./tests-compiler.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestsCompilerComponent extends Unsubscribe implements OnInit, OnDestroy {
  public getTestItem!: Observable<TestItemInterface[]>;
  public specialistPosition!: string;
  public positionEnum = TestLevelEnum;
  public testsCount!: number;
  public isModalOpen: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public testItem: TestItemInterface | null = null;

  private limit: number = 12;
  private employee$!: Observable<IEmployee>;
  private searchParams: SearchParams = { take: 12, skip: 0 };
  private currentPage: number = 1;

  constructor(
    private readonly _localStorage: LocalStorageService,
    private readonly _employeeFacade: EmployeeInfoFacade,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _router: Router,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _compilerFacade: CompilerFacade,
    private readonly _indexedDb: NgxIndexedDBService,
    private readonly _createTestFacade: CreateTestFacade
  ) {
    super();
  }

  ngOnInit(): void {
    this.clearCompilerTestsIndexDb().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    this.isRobot();
    this.getSpecialistDefaultPosition();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  public clearCompilerTestsIndexDb(): Observable<boolean> {
    return this._indexedDb.clear("compilerTests");
  }

  public opentStartTestsModal(item: TestItemInterface) {
    this.testItem = item;
    this.isModalOpen.next(true);
  }

  public confirmStartTest(action: boolean): void {
    this.modalToggle(false);
    if (action) {
      if (this.testItem) {
        this._compilerFacade.selectedLanguageUuid$.next(this.testItem.uuid);
        this._router.navigate([`/employee/create-test/compiler-test`]);
      }
    } else {
      this.testItem = null;
    }
  }

  public modalToggle(val?: boolean) {
    this.isModalOpen.next(val !== undefined ? val : !this.isModalOpen);
  }

  public getSpecialistDefaultPosition() {
    this._employeeFacade
      .getEmployee$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((specialist) => {
        specialistPosition.map((position) => {
          if (position.displayName === specialist?.position) {
            this.specialistPosition = position?.value;
            this.searchParams.languageUuids = JSON.parse(specialist?.languagesFrameworksForSelect).languages.map(
              (item: { id: string }) => {
                return item.id;
              }
            );
          }
        });
        this.getSelectedPaginationValue(1);
      });
  }

  public getTest(position: string, searchValue?: SearchParams): Observable<TestInterface | null> {
    if (this.specialistPosition) {
      this.getTestItem = this._createTestFacade.getCompilerTest(this.specialistPosition, searchValue).pipe(
        map((test) => {
          this.testsPagesCount(test.count);
          return test.data;
        })
      );
      this._cdr.markForCheck();
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
        filter((data) => !!data?.phone)
      )
      .subscribe((data) => {
        const currentPage = data.robot_helper?.find((item: { link: string }) => item.link === "/employee/create-test");

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
    return this._createTestFacade.getConvertTaskFullTime(milliseconds);
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
    const getPosition = specialistPosition.find((position: { value: string }) => position.value === chnagedPosition);
    return getPosition ? getPosition.displayName : "";
  }
}
