import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { NavigateButtonInterface } from "../../root-modules/app/interfaces/navigateButton.interface";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class NavigateButtonService {

  constructor(public http: HttpClient) {
  }

  public getButton(): Observable<NavigateButtonInterface[]> {
    const fullUrl = `${environment.jsonUrl}/navigateButtons`;
    return this.http.get<NavigateButtonInterface[]>(fullUrl);
  }

  public getButtonId(id: number): Observable<NavigateButtonInterface> {
    const fullUrl = `${environment.jsonUrl}/navigateButtons/${id}`;
    return this.http.get<NavigateButtonInterface>(fullUrl);
  }

  public editButton(id: number, status: NavigateButtonInterface): Observable<NavigateButtonInterface> {
    const fullUrl = `${environment.jsonUrl}/navigateButtons/${id}`;
    return this.http.put<NavigateButtonInterface>(fullUrl, status);
  }
}
