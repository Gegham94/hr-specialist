import {Injectable} from "@angular/core";
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from "@angular/common/http";

import {Observable} from "rxjs";
import {AuthService} from "../../modules/auth/auth.service";
import {environment} from "../../../environments/environment";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private readonly _authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this._authService.getToken;
    if (token) {
      if(environment.production) {
        request = request.clone({
          setHeaders: {Authorization: `Bearer ${token}`}
        });
      } else {
        request = request.clone({
          setHeaders: {Authorization: `Bearer ${token}`, mode: "dev"}
        });
      }
    }
    return next.handle(request);
  }
}
