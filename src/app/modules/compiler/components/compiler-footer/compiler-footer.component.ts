import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { CompilerTest } from "src/app/shared/interfaces/compiler-tests.interface";
import { CompilerFacade } from "../../services/compiler.facade";
import { takeUntil } from "rxjs";
import { ISelectBoxOptions } from "src/app/shared/interfaces/select-box.interface";

@Component({
  selector: "hr-compiler-footer",
  templateUrl: "./compiler-footer.component.html",
  styleUrls: ["./compiler-footer.component.scss"],
})
export class CompilerFooterComponent extends Unsubscribe implements OnInit, OnDestroy {
  public selectedTest: CompilerTest | null = null;
  public allTests: CompilerTest[] = [];
  public selectBoxOptions: ISelectBoxOptions = {
    isReversed: true,
    isOpen: false,
    label: "Тесты",
    optionsLabel: "Тест",
  };
  private currentTestIndex: number = 0;

  constructor(private readonly compilFacade: CompilerFacade, private readonly cdr: ChangeDetectorRef) {
    super();
  }

  public ngOnInit(): void {
    this.compilFacade
      .getSelectedTest$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((selectedTest) => {
        this.selectedTest = selectedTest;
        this.currentTestIndex = selectedTest?.index || 0;
        this.cdr.markForCheck();
      });

    this.compilFacade
      .getCompilerTests$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((allTests) => {
        this.allTests = allTests;
        this.cdr.markForCheck();
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  public loadPreviousTest(): void {
    const prevTest = this.allTests.find((test) => test.index === this.currentTestIndex - 1);
    if (prevTest) {
      this.compilFacade.setSelectedTest(prevTest);
    }
  }

  public loadNextTest(): void {
    const nextTest = this.allTests.find((test) => test.index === this.currentTestIndex + 1);
    if (nextTest) {
      this.compilFacade.setSelectedTest(nextTest);
    }
  }

  public setSelectedTestByIndex(index: number): void {
    const selectedTest = this.allTests.find((test) => test.index === index);
    if (selectedTest) {
      this.compilFacade.setSelectedTest(selectedTest);
    }
  }
}
