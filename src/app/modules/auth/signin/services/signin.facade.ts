import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, catchError, map, Observable, of, throwError } from "rxjs";
import { LocalStorageService } from "../../../../shared/services/local-storage.service";
import { IEmployee } from "../../../../shared/interfaces/employee.interface";
import { errorMock } from "../../errorMock/error-mock";
import { ErrorMsgType } from "../../error-message.type";
import { AuthService } from "../../service/auth.service";
import { SigninState } from "./signin.state";
import { ISignUpCredentials } from "src/app/shared/interfaces/sign-up.interface";
import { CookieService } from "../../../../shared/services/cookie.service";
import { environment } from "../../../../../environments/environment";
import { EmployeeInfoFacade } from "src/app/modules/profile/services/employee-info.facade";
import { ErrorMessageEnum } from "src/app/shared/interfaces/error-message-enum";
import { ISendPhone } from "src/app/shared/interfaces/send-phone-interface";
import { IResetPassword } from "src/app/shared/interfaces/reset-password.interface";

@Injectable({
  providedIn: "root",
})
export class SignInFacade {
  constructor(
    private readonly _router: Router,
    private readonly _authService: AuthService,
    private readonly _signInState: SigninState,
    private readonly _employeeFacade: EmployeeInfoFacade,
    private readonly _localStorageService: LocalStorageService,
    private readonly _cookieService: CookieService
  ) {}

  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public signIn(employee: ISignUpCredentials, rememberUser: boolean): Observable<void> {
    this.isLoader$.next(true);
    return this._authService.signIn(employee, rememberUser).pipe(
      map((employeeRaw: IEmployee) => {
        this._employeeFacade.setEmployee(employeeRaw);
        if (environment.production) {
          const cookieValue = this._cookieService.getCookie("access_token");
          if (!!cookieValue) {
            this._localStorageService.setItem("access_token", cookieValue);
          }
        } else {
          this._localStorageService.setItem("access_token", employeeRaw.access_token);
        }

        this._localStorageService.setItem("resumeMode", JSON.stringify("CREATE"));
        this._employeeFacade.setEmployeeUuid(employeeRaw?.uuid);
        this._router.navigateByUrl("/employee/resume").then();
        this.clearErrorMessage();
        return employeeRaw;
      }),
      catchError((error) => {
        this._signInState.setError({
          status: error.status,
          message: error.message,
        });
        this.isLoader$.next(false);
        this._employeeFacade.removeEmployeeData();
        return of(error);
      })
    );
  }

  public clearErrorMessage(): void {
    this._signInState.setError(null);
  }

  public clearPasswordForErrorMessage(): void {
    this._signInState.setErrorForPassword(null);
  }

  public getErrorMessage(): Observable<ErrorMsgType | string> {
    return this._signInState.getErrorMessage().pipe(
      map((error: ErrorMsgType) => {
        if (error?.status === 422) {
          return ErrorMessageEnum.INVALID_LOGIN;
        }
        if (error?.status === 403) {
          return ErrorMessageEnum.INVALID_PASSWORD;
        }
        if (error?.status === 400 || error?.status === 502 || error?.status === 404) {
          return error.message;
        }
        return "";
      })
    );
  }

  public sendPhoneNumber(sendPhone: ISendPhone): Observable<ISendPhone> {
    return this._authService.sendPhoneNumber(sendPhone).pipe(
      catchError((err: ErrorMsgType) => {
        if (err?.status && errorMock.includes(err?.status)) {
          this._signInState.setError(err);
        }
        return throwError(() => new Error(err?.message));
      })
    );
  }

  public sendResetPassword(resetPassword: IResetPassword) {
    return this._authService.sendResetPassword(resetPassword).pipe(
      catchError((err: ErrorMsgType) => {
        if (err?.status && errorMock.includes(err?.status)) {
          this._signInState.setError(err);
        }
        return throwError(() => new Error(err?.message));
      })
    );
  }
}
