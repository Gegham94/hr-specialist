import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { NavigateButton } from "./home-layout.interface";

@Injectable({
  providedIn: "root"
})
export class HomeLayoutState {
  private isRobotMap$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public buttonsStatuses: BehaviorSubject<NavigateButton[]> = new BehaviorSubject<NavigateButton[]>([
    {
      link: "/employee/employee-info/isActive",
      status: false
    },
    {
      link: "/employee/create-test/isActive",
      status: false
    },
    {
      link: "/employee/company-search/isActive",
      status: false
    },
    {
      link: "/employee/analytics/isActive",
      status: false
    },
    {
      link: "/employee/chat/isActive",
      status: false
    }
    ]);

  public updateNavigationButtons: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public get isRobotMap(): boolean {
    return this.isRobotMap$.value;
  }

  public set isRobotMap(value: boolean) {
    this.isRobotMap$.next(value);
  }

  public getIsRobotMap(): Observable<boolean> {
    return this.isRobotMap$ as Observable<boolean>;
  }

  public updateNavigationButtonsHandler(): void {
    this.updateNavigationButtons.next(true);
  }

  public isNavigationButtonsUpdate(): Observable<boolean>{
    return this.updateNavigationButtons.asObservable();
  }

  public getButtonsStatuses(): NavigateButton[] {
    return this.buttonsStatuses.value;
  }
}
