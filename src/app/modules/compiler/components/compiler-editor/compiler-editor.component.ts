import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";

import { MonacoEditorConstructionOptions } from "@materia-ui/ngx-monaco-editor";
import { BehaviorSubject, debounceTime, switchMap, takeUntil } from "rxjs";

import { ScreenSizeService } from "src/app/shared/services/screen-size.service";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { CompilerFacade } from "../../services/compiler.facade";
import { CompilerTest } from "src/app/shared/interfaces/compiler-tests.interface";

@Component({
  selector: "hr-compiler-editor",
  templateUrl: "./compiler-editor.component.html",
  styleUrls: ["./compiler-editor.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompilerEditorComponent extends Unsubscribe implements OnInit, OnDestroy {
  public testResultsLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public editorValueChanges$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public showResults: boolean = true;
  public editorOptions: MonacoEditorConstructionOptions = {
    language: "javascript",
    theme: localStorage.getItem("data-theme") === "dark" ? "vs-dark" : "vs",
    minimap: { enabled: true },
    automaticLayout: true,
  };
  public selectedTest: CompilerTest | null = null;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly compilerFacade: CompilerFacade,
    private readonly screenSizeService: ScreenSizeService
  ) {
    super();
  }

  public ngOnInit(): void {
    window.addEventListener("resize", (ev: Event) => {
      this.showResults = false;
      this.cdr.markForCheck();
    });

    this.compilerFacade
      .getSelectedTest$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((selectedTest) => {
        this.selectedTest = selectedTest;
        this.cdr.markForCheck();
      });

    this.saveEditorChangesInDb();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  public onMonacoInit(): void {
    this.compilerFacade.changeCompilerTheme$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (res === "dark") {
        monaco.editor.setTheme("vs-dark");
      } else {
        monaco.editor.setTheme("vs");
      }
    });
  }

  public toggleResultsCollapse(): void {
    if (this.screenSizeService.calcScreenSize === "DESKTOP") {
      return;
    }
    this.showResults = !this.showResults;
  }

  public isCollapse(): boolean {
    return this.screenSizeService.calcScreenSize !== "DESKTOP";
  }

  public onEditorValueChanges(changes: string): void {
    this.editorValueChanges$.next(changes);
  }

  private saveEditorChangesInDb(): void {
    this.editorValueChanges$.pipe(
      takeUntil(this.ngUnsubscribe),
      debounceTime(3000),
      switchMap(() => this.compilerFacade.updateTestsInDb$())
    ).subscribe();
  }
}
