import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../../../environments/environment";
import {Observable} from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ProfileViewService {

  constructor(
    private readonly _http: HttpClient
  ) {}

  public downloadPdf(): Observable<any> {
    return this._http.get(`${environment.fileDownload}/cv/download`,
      {
      responseType: "blob"
    });
  }
}
