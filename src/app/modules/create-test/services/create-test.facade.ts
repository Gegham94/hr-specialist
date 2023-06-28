import { Injectable } from "@angular/core";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { CreateTestService } from "./create-test-service";
import { TestInterface, TestInterfaceQuiz } from "../enum/test-item.interface";
import { Observable } from "rxjs";
import { SearchParams } from "../../profile/interfaces/search-params";

@Injectable({
  providedIn: "root",
})
export class CreateTestFacade extends Unsubscribe {

  constructor(
    private readonly _createTestService: CreateTestService
  ) {
    super()
  }

  //State getters
  public getQuizTest(position: string, searchValue?: SearchParams): Observable<TestInterfaceQuiz> {
    return this._createTestService.getSpecialistQuizTest(position, searchValue);
  }

  public getCompilerTest(position: string, searchValue?: SearchParams): Observable<TestInterface> {
    return this._createTestService.getSpecialistCompilerTest(position, searchValue);
  }

  public getConvertTaskFullTime(milliseconds: number): string{
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor(milliseconds / 1000);
    let time;
    if (hours === 0 && minutes > 0) {
      time = `${minutes}:${seconds} м`;
    } else if (hours === 0 && minutes === 0) {
      time = `${seconds} с`;
    } else if (hours > 0) {
      time = `${hours} :${minutes}:${seconds} ч.`;
    }
    // @ts-ignore
    return time;
  }
}
