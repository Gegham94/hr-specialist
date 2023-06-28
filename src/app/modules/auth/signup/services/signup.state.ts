import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {Observable} from "rxjs";
import {ErrorMsgType} from "../../error-message.type";

@Injectable({
  providedIn: "root"
})
export class SignUpState {
  private updating$ = new BehaviorSubject<boolean>(false);
  private errorMessage$ = new BehaviorSubject<ErrorMsgType>(null);

  setUpdating(isUpdating: boolean):void {
    this.updating$.next(isUpdating);
  }

  setError(message: ErrorMsgType):void {
    this.errorMessage$.next(message);
  }

  public getErrorMessage(): Observable<ErrorMsgType> {
    return this.errorMessage$.asObservable();
  }

  public removeErrorMessage() {
    this.errorMessage$.next(null);
  }
}
