import {Injectable} from "@angular/core";
import {Observable, BehaviorSubject} from "rxjs";
import {ErrorMsgType} from "../../error-message.type";

@Injectable({
  providedIn: "root"
})
export class SigninState {
  private signInError$ = new BehaviorSubject<ErrorMsgType>(null);
  private signInErrorForPassword$ = new BehaviorSubject<ErrorMsgType>(null);

  public setError(error: ErrorMsgType): void {
    this.signInError$.next(error);
  }

  public getErrorMessage(): Observable<ErrorMsgType> {
    return this.signInError$.asObservable();
  }

  public setErrorForPassword(error: ErrorMsgType): void {
    this.signInErrorForPassword$.next(error);
  }

  public getErrorForPasswordMessage(): Observable<ErrorMsgType> {
    return this.signInErrorForPassword$.asObservable();
  }
}
