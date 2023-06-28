import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import {
  switchMap,
  takeUntil,
  of,
  startWith,
  Observable,
  Subject,
  combineLatest,
  map,
  BehaviorSubject,
  take,
} from "rxjs";
import { ScreenSizeService } from "src/app/shared/services/screen-size.service";
import { CanComponentDeactivate } from "src/app/shared/guards/compiler-tests-leave.guard";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { CompilerFacade } from "./services/compiler.facade";
import { ScreenSizeType } from "src/app/shared/interfaces/screen-size.type";

@Component({
  selector: "app-compiler",
  templateUrl: "./compiler.component.html",
  styleUrls: ["./compiler.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompilerComponent extends Unsubscribe implements OnInit, AfterViewInit, OnDestroy, CanComponentDeactivate {
  public isContentLoading: boolean = true;
  public isTaskDrawerOpen: boolean = false;
  public isModalOpenFail: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public get screenSize(): ScreenSizeType {
    return this._screenSizeService.calcScreenSize;
  }

  public get mobilLayoutHeight(): number {
    return this._screenSizeService.layoutHeightMobile;
  }

  private clickNotifier$: Subject<void> = new Subject<void>();
  private navigationStatus$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private readonly _screenSizeService: ScreenSizeService,
    private readonly _compilerFacade: CompilerFacade,
    private readonly _cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnInit(): void {
    this._compilerFacade.setShouldDeactivate(false);
    this._compilerFacade
      .checkDbForTests$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((testsInDb) => {
          if (!testsInDb || testsInDb === undefined) {
            return this._compilerFacade.selectedLanguageUuid$.pipe(
              takeUntil(this.ngUnsubscribe),
              switchMap((selectedLanguageUuid) => {
                if (!selectedLanguageUuid) {
                  this._compilerFacade.setShouldDeactivate(true);
                  return of(null);
                }
                return this._compilerFacade.getCompilerTestsByLanguageUuid(selectedLanguageUuid);
              })
            );
          }
          return this._compilerFacade.setAllTestsAndSettingsInState$(testsInDb);
        })
      )
      .subscribe(() => {
        this.isContentLoading = false;
        this._cdr.markForCheck();
      });
  }

  public ngAfterViewInit(): void {
    this._screenSizeService.screenSize$
      .pipe(takeUntil(this.ngUnsubscribe), startWith(this.screenSize))
      .subscribe((size) => {
        if (size !== "DESKTOP") {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "auto";
        }
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  public toggleTaskDrawer(): void {
    this.isTaskDrawerOpen = !this.isTaskDrawerOpen;
  }

  public canDeactivate(): boolean | Observable<boolean> {
    this.modalToggleFail(true);
    return combineLatest([this.navigationStatus$, this.clickNotifier$]).pipe(map(([boolean]) => boolean));
  }

  public isCanNavigate(action: boolean): void {
    if (action) {
      this._compilerFacade
        .applyAllTests$()
        .pipe(
          take(1),
          takeUntil(this.ngUnsubscribe),
          switchMap(() => {
            this._compilerFacade.setShouldDeactivate(true);
            this.clickNotifier$.next();
            this.navigationStatus$.next(true);
            this.modalToggleFail(false);
            return this._compilerFacade.clearCompilerTestsIndexDb$().pipe(take(1));
          })
        )
        .subscribe();
    } else {
      this.modalToggleFail(false);
      this.clickNotifier$.next();
      this.navigationStatus$.next(false);
    }
  }

  public modalToggleFail(val: boolean) {
    this.isModalOpenFail.next(val ? val : !this.isModalOpenFail);
    document.body.style.overflowY = "scroll";
  }
}
