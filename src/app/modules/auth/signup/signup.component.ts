import { Component, OnDestroy, OnInit } from "@angular/core";
import { ButtonTypeEnum } from "../../../root-modules/app/constants/button-type.enum";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { HeaderTypeEnum } from "../../../root-modules/app/constants/header-type.enum";
import { InputTypeEnum } from "../../../root-modules/app/constants/input-type.enum";
import { SignUpFacade } from "./signup.facade";
import { BehaviorSubject, takeUntil } from "rxjs";
import { InputStatusEnum } from "../../../root-modules/app/constants/input-status.enum";
import { SignUpState } from "./signup.state";
import { ValidateForPassword } from "../../../root-modules/app/validators/signup-password-validator";
import { Unsubscribe } from "src/app/shared-modules/unsubscriber/unsubscribe";
import { Router } from "@angular/router";
import { ToastsService } from "../../../root-modules/app/services/toasts.service";
import { TranslateService } from "@ngx-translate/core";

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
  public prefix = "+7";

  constructor(
    private readonly _formBuilder: UntypedFormBuilder,
    private readonly _signUpFacade: SignUpFacade,
    private readonly _signupState: SignUpState,
    private readonly _router: Router,
    private readonly _toastService: ToastsService,
    private readonly _translateService: TranslateService,
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
    this.signUpForm = this._formBuilder.group(
      {
        phone: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
        password: [null, [Validators.required]],
        privacy_policy: [false, [Validators.required]],
      },
      {
        validators: ValidateForPassword,
      }
    );
  }

  public signUpCompleted(form: UntypedFormGroup): void {
    this._signUpFacade.setUpdating(false);
    if (form.valid) {
      const sendFormValue = [form.value].map((value) => {
        if (typeof value?.privacy_policy == "boolean") {
          return {
            ...form.value,
            privacy_policy: String(value?.privacy_policy),
          };
        }
      });

      this._signUpFacade.signUp(sendFormValue[0]).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        const message =
            this._translateService.instant("AUTHORIZATION.SIGN_UP.SUCCESS_MESSAGE.1") +
            "\n" +
            this._translateService.instant("AUTHORIZATION.SIGN_UP.SUCCESS_MESSAGE.3");
          this._toastService.addToast({ title: message }, 6000);
          this._router.navigateByUrl('/signIn');
      });
    }
  }

  public navigateToLogin() {
    this._router.navigateByUrl('/signIn');
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
