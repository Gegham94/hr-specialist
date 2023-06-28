import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {NavigateButtonState} from "./navigate-button.state";
import { NavigationButton } from "src/app/shared/interfaces/navigateButton.interface";

@Injectable({
    providedIn: "root"
})
export class NavigateButtonFacade {
    constructor(private readonly _navigateButtonState: NavigateButtonState) {}

  public getShowedNavigationsMenu$(): Observable<NavigationButton[] | null> {
    return this._navigateButtonState.getShowedNavigationsMenu$();
  }

  public getShowedNavigationsMenu(): NavigationButton[] | null {
    return this._navigateButtonState.getShowedNavigationsMenu();
  }

  public setShowedNavigationsMenu$(value: NavigationButton[]){
    return this._navigateButtonState.setShowedNavigationsMenu(value);
  }
}
