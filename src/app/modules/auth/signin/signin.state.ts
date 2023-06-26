import {Injectable} from "@angular/core";
import {Observable, BehaviorSubject} from "rxjs";
import {ErrorMsg} from "../error-message.type";

@Injectable({
  providedIn: "root"
})
export class SigninState {
  private signInError$ = new BehaviorSubject<ErrorMsg>(null);
  private signInErrorForPassword$ = new BehaviorSubject<ErrorMsg>(null);

  public setError(error: ErrorMsg): void {
    this.signInError$.next(error);
  }

  public getErrorMessage(): Observable<ErrorMsg> {
    return this.signInError$.asObservable();
  }

  public setErrorForPassword(error: ErrorMsg): void {
    this.signInErrorForPassword$.next(error);
  }

  public getErrorForPasswordMessage(): Observable<ErrorMsg> {
    return this.signInErrorForPassword$.asObservable();
  }
}
