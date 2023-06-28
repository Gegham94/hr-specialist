import { Injectable } from "@angular/core";
import { AuthService } from "../../service/auth.service";
import { SignUpState } from "./signup.state";
import { BehaviorSubject, catchError, filter, finalize, map, Observable, throwError } from "rxjs";
import { IEmployee } from "../../../../shared/interfaces/employee.interface";
import { ErrorMsgType } from "../../error-message.type";
import { ISignUpCredentials } from "src/app/shared/interfaces/sign-up.interface";

@Injectable({
  providedIn: "root",
})
export class SignUpFacade {
  constructor(
    private readonly _authService: AuthService,
    private readonly _signUpState: SignUpState,
  ) {}

  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  signUp(employeeRaw: ISignUpCredentials): Observable<IEmployee | null> {
    this.isLoader$.next(true);
    return this._authService.signUp(employeeRaw).pipe(
      finalize(() => this.isLoader$.next(false)),
      map((employee: IEmployee) => {
        if (employee) {
          this.setUpdating(true);
          this._signUpState.removeErrorMessage();
          return employee;
        }
        return null;
      }),
      catchError((error) => {
        this._signUpState.setError({
          status: error.status,
          message: error.message,
        });
        this.setUpdating(false);
        return throwError(() => new Error("Sing up attempt failed"));
      })
    );
  }

  public clearErrorMessage(): void {
    this._signUpState.setError(null);
  }

  public getErrorMessage(): Observable<ErrorMsgType> {
    return this._signUpState.getErrorMessage().pipe(filter((error: ErrorMsgType) => error?.status === 422 || !error));
  }

  setUpdating(val: boolean): void {
    this._signUpState.setUpdating(val);
  }
}
