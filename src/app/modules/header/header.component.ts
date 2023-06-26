import { ChangeDetectionStrategy, Component, HostListener, Input, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, Subject, combineLatest, map, takeUntil } from "rxjs";
import { Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { HeaderFacade } from "./header.facade";
import { HeaderDropdownsEnum } from "./constants/header-dropdowns.enum";
import { EmployeeInfoFacade } from "../profile/components/utils/employee-info.facade";
import { IEmployee } from "../../root-modules/app/interfaces/employee.interface";
import { ButtonTypeEnum } from "../../root-modules/app/constants/button-type.enum";
import { LocalStorageService } from "../../root-modules/app/services/local-storage.service";
import { Unsubscribe } from "src/app/shared-modules/unsubscriber/unsubscribe";
import { ResumeStateService } from "../profile/components/utils/resume-state.service";
import { QuizState } from "../create-test/quiz/quiz.state";
import { CompilerState } from "../create-test/compiler/compiler.state";

@Component({
  selector: "hr-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent extends Unsubscribe implements OnInit, OnDestroy {
  @Input("notification-count") notificationCountProps?: number;
  @Input("header-type") headerTypeProps!: string;
  public logo!: string;
  public buttonType = ButtonTypeEnum;
  public isDropdownOpen$ = this._headerFacade.getStateDropdown$(HeaderDropdownsEnum.menu);
  public employee$!: Observable<IEmployee>;
  public isMenuOpen: boolean = false;

  public isModalOpen: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public clickNotifier$: Subject<void> = new Subject<void>();
  public navigationStatus$: Subject<boolean> = new Subject<boolean>();

  @HostListener("window:resize", ["$event"])
  onResize() {
    if (this.isMenuOpen) {
      this.isMenuOpen = !this.isMenuOpen;
      document.body.style.overflow = "auto";
    }
  }

  constructor(
    private readonly _headerFacade: HeaderFacade,
    private readonly _router: Router,
    private readonly _authService: AuthService,
    private readonly _localStorageService: LocalStorageService,
    public readonly _employeeFacade: EmployeeInfoFacade,
    private readonly _resumeState: ResumeStateService,
    private _quizState: QuizState,
    private _compilerState: CompilerState,
  ) {
    super();
    // this.selectedLang = this._localStorageService.getItem("language") ?? defaultLang;
  }

  ngOnInit() {
    if (this.isLogged) {
      this.employee$ = this._employeeFacade.getEmployee$();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  public logOut(): void {
    console.log("xxxxxxxxxxxx");
    let isInTests = localStorage.getItem('isInTests');
    if (isInTests && isInTests === 'true') {
      this.isModalOpen.next(true);
      this._compilerState.setShouldDeactivate(false);
      this._quizState.setShouldDeactivate(false);
    } else {
      this.isModalOpen.next(false);
      this._compilerState.setShouldDeactivate(true);
      this._quizState.setShouldDeactivate(true);
      this.confirmNavigation(true);
    }
  }

  public confirmNavigation(action: boolean) {
    localStorage.removeItem('isInTests');
    this.clickNotifier$.next();
    this.navigationStatus$.next(action);
    this._authService.logOut();
    this._employeeFacade.removeEmployeeData();
  }

  public cancelNavigation(action: boolean) {
    this.isModalOpen.next(false);
    this.clickNotifier$.next();
    this.navigationStatus$.next(action)
  }

  public canDeactivate(): boolean | Observable<boolean> {
    this.isModalOpen.next(true);
    return combineLatest([this.navigationStatus$, this.clickNotifier$]).pipe(map(([boolean, smth]) => boolean));
  }

  public modalToggle(val?: boolean) {
    this.isModalOpen.next(val !== undefined ? val : !this.isModalOpen);
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
      if (employee.name) {
        this._router.navigateByUrl("/employee/resume").then();
        return;
      }
      this._router.navigateByUrl("/employee/resume/edit/info").then();
    }
  }

  // public switchLang(index: number): void {
  //   this._translate.use(Languages[index]);
  //   this.selectedLang = Languages[index];
  //   this._localStorageService.setItem("language", Languages[index]);
  // }

  public isMenuOpenHandler(): void {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.classList.toggle("active");
    if (this.isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }
  }

  public close(event: Event) {
    event.stopPropagation();
    this._headerFacade.resetDropdownsState(HeaderDropdownsEnum.menu, false);
  }
}
