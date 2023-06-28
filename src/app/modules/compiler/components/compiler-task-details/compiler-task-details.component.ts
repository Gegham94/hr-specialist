import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { takeUntil } from "rxjs";
import { CompilerTest } from "src/app/shared/interfaces/compiler-tests.interface";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { CompilerFacade } from "../../services/compiler.facade";

@Component({
  selector: "hr-compiler-task-details",
  templateUrl: "./compiler-task-details.component.html",
  styleUrls: ["./compiler-task-details.component.scss"],
})
export class CompilerTaskDetailsComponent extends Unsubscribe implements OnInit, OnDestroy {
  public selectedTest: CompilerTest | null = null;

  constructor(private readonly cdr: ChangeDetectorRef, private readonly compilFacade: CompilerFacade) {
    super();
  }

  ngOnInit(): void {
    this.compilFacade
      .getSelectedTest$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((selectedTest) => {
        this.selectedTest = selectedTest;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
