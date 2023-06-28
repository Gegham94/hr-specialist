import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, Subject, takeUntil } from "rxjs";
import { Router } from "@angular/router";
import { AuthService } from "../auth/service/auth.service";
import { HeaderFacade } from "./services/header.facade";
import { HeaderDropdownsEnum } from "./constants/header-dropdowns.enum";
import { IEmployee } from "../../shared/interfaces/employee.interface";
import { LocalStorageService } from "../../shared/services/local-storage.service";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { ScreenSizeEnum } from "../../shared/constants/screen-size.enum";
import { ScreenSizeService } from "../../shared/services/screen-size.service";
import { QuizFacade } from "../quiz/quiz.facade";
import { EmployeeInfoFacade } from "../profile/services/employee-info.facade";
import { CompilerFacade } from "../compiler/services/compiler.facade";
import { ScreenSizeType } from "src/app/shared/interfaces/screen-size.type";

@Component({
  selector: "hr-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent extends Unsubscribe implements OnInit, OnDestroy {
  public isDropdownOpen$ = this._headerFacade.getStateDropdown$(HeaderDropdownsEnum.menu);
  public isModalOpen$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public screenSizeType$: BehaviorSubject<ScreenSizeType> = new BehaviorSubject<ScreenSizeType>(ScreenSizeEnum.DESKTOP);
  public closeDrawer$: BehaviorSubject<"open" | "close" | null> = new BehaviorSubject<"open" | "close" | null>(null);
  public isMenuOpen: boolean = false;
  public employee$!: Observable<IEmployee>;

  private clickNotifier$: Subject<void> = new Subject<void>();
  private navigationStatus$: Subject<boolean> = new Subject<boolean>();

  private readonly ScreenSizeEnum = ScreenSizeEnum;

  @HostListener("window:resize", ["$event"])
  onResize() {
    if (this.isMenuOpen) {
      this.isMenuOpen = !this.isMenuOpen;
    }
  }

  public get drawerWidth(): number {
    return this.screenSizeType$.value == ScreenSizeEnum.EXTRA_SMALL ? 100 : 70;
  }

  constructor(
    private readonly _headerFacade: HeaderFacade,
    private readonly _router: Router,
    private readonly _authService: AuthService,
    private readonly _localStorageService: LocalStorageService,
    private readonly _employeeFacade: EmployeeInfoFacade,
    private readonly _quizFacade: QuizFacade,
    private readonly _screenSizeService: ScreenSizeService,
    private readonly _compilerFacade: CompilerFacade
  ) {
    super();
  }

  public ngOnInit(): void {
    if (this.isLogged) {
      this.employee$ = this._employeeFacade.getEmployee$();
      this.screenSizeType$.next(this._screenSizeService.calcScreenSize);
      this._screenSizeService.screenSize$
        .pipe(takeUntil(this.ngUnsubscribe))
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((type: ScreenSizeType) => {
          this.screenSizeType$.next(type);
        });
    }
  }

  public openMenu(): void {
    this.isMenuOpen = true;
    document.body.style.overflowY = "hidden";
  }

  public confirmNavigation(action: boolean): void {
    this.clickNotifier$.next();
    this.navigationStatus$.next(action);
    if (action) {
      this._authService.logOut();
    } else {
      this.isModalOpen$.next(false);
    }
  }

  public modalToggle(val?: boolean): void {
    this.isModalOpen$.next(val !== undefined ? val : !this.isModalOpen$);
  }

  public navigate(link: string): void {
    this.isMenuOpenHandler();
    this._router.navigate([link]);
  }

  public dropMenuToggle(newState?: boolean): void {
    this._headerFacade.resetDropdownsState(HeaderDropdownsEnum.menu, newState);
  }

  public get isLogged(): boolean {
    return !!(this._authService.getToken && this._authService.isTokenExpired);
  }

  public goToProfile(): void {
    if (this.isLogged && this._localStorageService.getItem("resume")) {
      const employee = JSON.parse(this._localStorageService.getItem("resume"));
      this.isMenuOpen = false;
      document.body.style.overflowY = "auto";
      if (employee.name) {
        this._router.navigateByUrl("/employee/resume").then();
        return;
      }
      this._router.navigateByUrl("/employee/resume/edit/info").then();
    }
  }

  public isMenuOpenHandler(): void {
    this.isMenuOpen = false;
    document.body.style.overflowY = "auto";
    this.closeDrawer$.next(null);
  }

  public close(event: Event): void {
    event.stopPropagation();
    this._headerFacade.resetDropdownsState(HeaderDropdownsEnum.menu, false);
  }

  public logOut(): void {
    const shouldDeactivate = this._compilerFacade.getShouldDeactivate() && this._quizFacade.getShouldDeactivate();
    if (!shouldDeactivate) {
      this.isModalOpen$.next(true);
    } else {
      this.isModalOpen$.next(false);
      this.confirmNavigation(true);
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
