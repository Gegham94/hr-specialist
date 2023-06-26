import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IEmployee } from "../interfaces/employee.interface";

@Injectable({
  providedIn: "root",
})
export class LocalStorageService {
  public resume$: BehaviorSubject<IEmployee | null> = new BehaviorSubject<IEmployee | null>(null);

  constructor() {}

  public setItem(key: string, value: string) {
    if (key === "resume") {
      this.resume$.next(JSON.parse(value));
    }
    localStorage.setItem(key, value);
  }

  public getItem(key: string): string {
    return localStorage.getItem(key) || "";
  }

  public removeData(key: string) {
    localStorage.removeItem(key);
  }

  public clearData() {
    localStorage.clear();
  }
}
