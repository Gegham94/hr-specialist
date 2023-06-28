import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { INavigateButton } from "src/app/shared/interfaces/navigateButton.interface";

@Injectable({
  providedIn: "root",
})
export class NavigateButtonService {
  constructor(public http: HttpClient) {}

  public getButton(): Observable<INavigateButton[]> {
    const fullUrl = `${environment.jsonUrl}/navigateButtons`;
    return this.http.get<INavigateButton[]>(fullUrl);
  }

  public getButtonId(id: number): Observable<INavigateButton> {
    const fullUrl = `${environment.jsonUrl}/navigateButtons/${id}`;
    return this.http.get<INavigateButton>(fullUrl);
  }

  public editButton(id: number, status: INavigateButton): Observable<INavigateButton> {
    const fullUrl = `${environment.jsonUrl}/navigateButtons/${id}`;
    return this.http.put<INavigateButton>(fullUrl, status);
  }
}
