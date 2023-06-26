import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {Observable} from "rxjs";
import {ErrorMsg} from "../error-message.type";

@Injectable({
  providedIn: "root"
})
export class SignUpState {
  private updating$ = new BehaviorSubject<boolean>(false);
  private errorMessage$ = new BehaviorSubject<ErrorMsg>(null);

  setUpdating(isUpdating: boolean):void {
    this.updating$.next(isUpdating);
  }

  setError(message: ErrorMsg):void {
    this.errorMessage$.next(message);
  }

  public getErrorMessage(): Observable<ErrorMsg> {
    return this.errorMessage$.asObservable();
  }

  public removeErrorMessage() {
    this.errorMessage$.next(null);
  }
}
