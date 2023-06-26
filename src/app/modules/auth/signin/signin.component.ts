import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { Observable, startWith, takeUntil, combineLatest, switchMap, BehaviorSubject } from "rxjs";

import { ErrorMessageEnum } from "../../../root-modules/app/interfaces/error-message-enum";
import { InputStatusEnum } from "../../../root-modules/app/constants/input-status.enum";
import { ButtonTypeEnum } from "../../../root-modules/app/constants/button-type.enum";
import { HeaderTypeEnum } from "../../../root-modules/app/constants/header-type.enum";
import { InputTypeEnum } from "../../../root-modules/app/constants/input-type.enum";
import { Unsubscribe } from "../../../shared-modules/unsubscriber/unsubscribe";
import { AuthService } from "../auth.service";
import { SignInFacade } from "./signin.facade";
import { ResumeStateService } from "../../profile/components/utils/resume-state.service";

@Component({
  selector: "hr-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.scss"],
})
export class SigninComponent extends Unsubscribe implements OnInit, OnDestroy {
  public buttonType = ButtonTypeEnum;
  public isPasswordModalOpen: boolean = false;
  public inputTypeProps: InputTypeEnum = InputTypeEnum.password;
  public headerTypeProps: HeaderTypeEnum = HeaderTypeEnum.login;
  public signin!: UntypedFormGroup;
  public sendPhoneForm!: UntypedFormGroup;
  public getErrorMessage$!: Observable<string>;
  public prefix = "+7";
  public resetPsw: boolean = false;
  public inputStatusList = InputStatusEnum;
  public errorMessageEnum = ErrorMessageEnum;
  public isError: boolean = false;
  public userDoesNotExistsError = this._signInFacade.getErrorMessage();
  private isRememberUser: boolean = false;

  public get sendPhoneControl() {
    return this.sendPhoneForm.get("phone") as UntypedFormControl;
  }

  public get signInPhoneNumberControl(): UntypedFormControl {
    return this.signin.get("phone") as UntypedFormControl;
  }

  public get signInPasswordControl(): UntypedFormControl {
    return this.signin.get("password") as UntypedFormControl;
  }

  public get loader$(): BehaviorSubject<boolean> {
    return this._signInFacade.isLoader$;
  }

  constructor(
    private readonly _formBuilder: UntypedFormBuilder,
    private readonly _resumeState: ResumeStateService,
    private readonly _signInFacade: SignInFacade,
    private readonly _authService: AuthService,
    private readonly _router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this._navigateToCreateUserPage();
    this._initializeValue();
    this._clearErrorMessageDuringFormValueChange();
  }

  ngOnDestroy(): void {
    this._signInFacade.clearErrorMessage();
    this.unsubscribe();
    this._signInFacade.isLoader$.next(false);
  }

  public passwordModal(state: boolean): void {
    this.isPasswordModalOpen = state ? state : !this.isPasswordModalOpen;
    if (!this.isPasswordModalOpen) {
      this.sendPhoneForm.reset();
    }
    this.resetPsw = false;
  }

  public signIn(form: UntypedFormGroup): void {
    if (form.valid) {
      this._resumeState
        .clearAllStores()
        .pipe(
          takeUntil(this.ngUnsubscribe),
          switchMap(() => this._signInFacade.signIn(form.value, this.isRememberUser))
        )
        .subscribe(()=>{
          this._authService.logInEvent();
        });
    }
  }

  public rememberUser(isRememberUser: boolean): void {
    this.isRememberUser = isRememberUser;
  }

  public sendPhone(event?: boolean): void {
    if (this.sendPhoneControl.valid) {
      const phone = {
        phone: this.sendPhoneControl.value,
        prefix: this.prefix,
      };

      this._signInFacade
        .sendPhoneNumber(phone)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            if (!event) {
              this.resetPsw = !this.resetPsw;
              this.isPasswordModalOpen = !this.isPasswordModalOpen;
            }
          },
          error: (error) => {
            this.isError = true;
          },
        });
    }
  }

  private _clearErrorMessageDuringFormValueChange(): void {
    combineLatest([
      this.signInPhoneNumberControl.valueChanges.pipe(startWith(null)),
      this.sendPhoneControl.valueChanges.pipe(startWith(null)),
      this.signInPasswordControl.valueChanges.pipe(startWith(null)),
    ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(([phoneNumberError, sendPhoneError, passwordError]) => {
        if (phoneNumberError) {
          this._signInFacade.clearErrorMessage();
        }
        if (sendPhoneError) {
          this.isError = false;
        }
        if (passwordError) {
          this._signInFacade.clearPasswordForErrorMessage();
        }
      });
  }

  private _initializeValue(): void {
    this.signin = this._formBuilder.group({
      phone: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      password: [null, [Validators.required, Validators.minLength(8)]],
    });
    this.sendPhoneForm = this._formBuilder.group({
      phone: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    });
  }

  private _navigateToCreateUserPage() {
    if (this._authService.getToken && this._authService.isTokenExpired) {
      this._router.navigateByUrl("/employee/resume");
    }
  }
}
