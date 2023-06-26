import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {NoCredentialsUrls, SpecialistProfileUrl} from "../constants/with-credentials.constants";
import {environment} from "../../../environments/environment";

@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
  constructor() {
  }
  // tslint:disable-next-line:no-any
  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const endpointUrl = httpRequest.url.split("v1/")[1];
    if (endpointUrl && !NoCredentialsUrls.includes(endpointUrl)
      && !endpointUrl.includes(SpecialistProfileUrl) && environment.production
    ) {
      const reqCopy = httpRequest.clone({
        headers: httpRequest.headers.set("Access-Control-Allow-Credentials", "true"),
        withCredentials: true,
        body: {
          ...httpRequest.body
        }
      });
      return next.handle(reqCopy);
    }
    return next.handle(httpRequest);
  }
}
