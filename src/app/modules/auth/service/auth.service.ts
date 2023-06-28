import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import jwt_decode from "jwt-decode";
import { Observable } from "rxjs";

import { environment } from "../../../../environments/environment";
import { ISignUpCredentials } from "src/app/shared/interfaces/sign-up.interface";
import { Router } from "@angular/router";
import { EmployeeInfoFacade } from "../../profile/services/employee-info.facade";
import { ResumeStateService } from "../../profile/services/resume-state.service";
import { IEmployee } from "src/app/shared/interfaces/employee.interface";
import { ISendPhone } from "src/app/shared/interfaces/send-phone-interface";
import { IResetPassword } from "src/app/shared/interfaces/reset-password.interface";

type JWTDeCode = {
  exp: number;
  iat: number;
  sub: string;
  user: IEmployee;
};

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly employeeSignIn = "specialist/signIn";
  private readonly employeeSignUp = "specialist/signUp";
  private readonly sendNewPasswordForReset = "specialist/verifyResetPassword";
  private readonly sendPhoneForResetSpecialistPsw = "specialist/resetPassword";
  private readonly broadcastChannel!: BroadcastChannel;

  get isTokenExpired(): boolean {
    const token = localStorage.getItem("access_token");
    if (token != null) {
      const decoded = jwt_decode<JWTDeCode>(token);
      const expiryTime = decoded.exp;
      if (expiryTime && 1000 * expiryTime - new Date().getTime() < 0) {
        this.logOut();
        // this._router.navigateByUrl("/signIn");
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  public get getToken() {
    return localStorage.getItem("access_token");
  }

  constructor(
    private readonly _http: HttpClient,
    private readonly _router: Router,
    private readonly _resumeState: ResumeStateService,
    private readonly _employeeInfoFacade: EmployeeInfoFacade
  ) {
    this.broadcastChannel = new BroadcastChannel("auth_channel");
    this.broadcastChannel.onmessage = (event) => {
      if (event.data === "logout") {
        this._resumeState.clearAllStores().subscribe((data) => {
          // this._router.navigate(["/signIn"], { replaceUrl: true });
          location.replace("/");
        });
        localStorage.clear();
        this._router.navigateByUrl("/signIn");
      }
      if (event.data === "login") {
        location.reload();
      }
    };
  }

  public setToken(access_token: string | undefined): void {
    if (access_token != null) {
      localStorage.setItem("access_token", access_token);
    }
  }

  public logInEvent(): void {
    this.broadcastChannel.postMessage("login");
  }

  public logOutEvent(): void {
    this.broadcastChannel.postMessage("logout");
  }

  public logOut(): void {
    this._resumeState.clearAllStores().subscribe(() => {
      location.replace("/");
    });
    localStorage.clear();
    this._employeeInfoFacade.removeEmployeeData();
    this.logOutEvent();
  }

  public signIn(login: ISignUpCredentials, rememberUser: boolean): Observable<IEmployee> {
    const fullUrl = `${environment.url}/${this.employeeSignIn}`;
    return this._http.post<IEmployee>(fullUrl, { ...login, remember: String(rememberUser) });
  }

  public signUp(signUp: ISignUpCredentials): Observable<IEmployee> {
    const fullUrl = `${environment.url}/${this.employeeSignUp}`;
    return this._http.post<IEmployee>(fullUrl, { ...signUp });
  }

  public sendPhoneNumber(phoneNumber: ISendPhone): Observable<ISendPhone> {
    const fullUrl = `${environment.url}/${this.sendPhoneForResetSpecialistPsw}`;
    return this._http.post<ISendPhone>(fullUrl, { ...phoneNumber });
  }

  public sendResetPassword(resetPassword: IResetPassword): Observable<IResetPassword> {
    const fullUrl = `${environment.url}/${this.sendNewPasswordForReset}`;
    return this._http.post<IResetPassword>(fullUrl, { ...resetPassword });
  }
}
