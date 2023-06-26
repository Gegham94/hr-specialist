import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {SpecialistTestInterface} from "./interfaces/tests.interface";

@Injectable({
  providedIn: "root"
})
export class AnalyticService {

  constructor(public http: HttpClient) {
  }
  private readonly recruiterSpecialist = "recruiter/specialist";

  public getSpecialistCard(uuid: string): Observable<SpecialistTestInterface> {
    const fullUrl = `${environment.recruiter}/${this.recruiterSpecialist}/${uuid}`;
    return this.http.get<SpecialistTestInterface>(`${fullUrl}`);
  }
}
