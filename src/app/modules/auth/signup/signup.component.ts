import { Component, OnDestroy, OnInit } from "@angular/core";
import { ButtonTypeEnum } from "../../../shared/constants/button-type.enum";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { SignUpFacade } from "./services/signup.facade";
import { BehaviorSubject, takeUntil } from "rxjs";
import { SignUpState } from "./services/signup.state";
import { ValidateForPassword } from "../../../shared/validators/signup-password-validator";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { Router } from "@angular/router";
import { ToastsService } from "../../../shared/services/toasts.service";
import { TranslateService } from "@ngx-translate/core";
import { PHONE_NUMBER_PREFIX } from "src/app/shared/constants/const-varibale";
import { HeaderTypeEnum } from "src/app/shared/constants/header-type.enum";
import { InputTypeEnum } from "src/app/shared/constants/input-type.enum";
import { InputStatusEnum } from "src/app/shared/constants/input-status.enum";

@Component({
  selector: "hr-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent extends Unsubscribe implements OnInit, OnDestroy {
  public buttonType = ButtonTypeEnum;
  public signUpForm!: UntypedFormGroup;
  public headerTypeProps: HeaderTypeEnum = HeaderTypeEnum.register;
  public inputTypeProps: InputTypeEnum = InputTypeEnum.password;
  public userDoesNotExistsError = this._signUpFacade.getErrorMessage();
  public inputStatusList = InputStatusEnum;
  public prefix = PHONE_NUMBER_PREFIX;

  constructor(
    private readonly _formBuilder: UntypedFormBuilder,
    private readonly _signUpFacade: SignUpFacade,
    private readonly _signupState: SignUpState,
    private readonly _router: Router,
    private readonly _toastService: ToastsService,
    private readonly _translateService: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initSignUpForm();
    this.signUpPhoneControl?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this._signUpFacade.clearErrorMessage();
    });
  }

  public initSignUpForm(): void {
    this.signUpForm = this._formBuilder.group({
      phone: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      password: [null, [Validators.required, ValidateForPassword]],
      privacy_policy: [false, [Validators.required]],
    });
  }

  public signUpCompleted(form: UntypedFormGroup): void {
    this._signUpFacade.setUpdating(false);
    if (form.valid) {
      const sendFormValue = {
        ...form.value,
        privacy_policy: String(form.value.privacy_policy),
      };

      this._signUpFacade
        .signUp(sendFormValue)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          const message =
            this._translateService.instant("AUTHORIZATION.SIGN_UP.SUCCESS_MESSAGE.1") +
            "\n" +
            this._translateService.instant("AUTHORIZATION.SIGN_UP.SUCCESS_MESSAGE.3");
          this._toastService.addToast({ title: message }, 6000);
          this._router.navigateByUrl("/signIn");
        });
    }
  }

  public navigateToLogin() {
    this._router.navigateByUrl("/signIn");
  }

  get signUpPhoneControl(): UntypedFormControl {
    return this.signUpForm.get("phone") as UntypedFormControl;
  }

  get signUpPasswordControl(): UntypedFormControl {
    return this.signUpForm.get("password") as UntypedFormControl;
  }

  public get signUpPrivacyPolicyControl(): UntypedFormControl {
    return this.signUpForm.get("privacy_policy") as UntypedFormControl;
  }

  public get loader$(): BehaviorSubject<boolean> {
    return this._signUpFacade.isLoader$;
  }

  public changeSignUpPrivacyPolicy(event?: Event): void {
    if (event) {
      return;
    }
    this.signUpPrivacyPolicyControl.setValue(!this.signUpPrivacyPolicyControl.value);
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    this._signupState.removeErrorMessage();
  }
}
