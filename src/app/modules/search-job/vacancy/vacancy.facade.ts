import {Injectable} from "@angular/core";
import {VacancyService} from "./vacancy-service";
import {Observable} from "rxjs";
import {SearchInterface} from "../../../root-modules/app/interfaces/searc.interface";
import {SearchVacancyResultInterface} from "./interfaces/search-vacancy.interface";

@Injectable({
  providedIn: "root"
})
export class VacancyFacade {
  constructor(private readonly _vacancyService: VacancyService) {
  }

  public getAllVacancies$(searchParams: SearchInterface): Observable<SearchVacancyResultInterface> {
    return this._vacancyService.getAllVacancies$(searchParams);
  }
}
