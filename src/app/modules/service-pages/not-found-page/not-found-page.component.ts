import { Component } from "@angular/core";
import { Location } from "@angular/common";
import { ButtonTypeEnum } from "../../../shared/constants/button-type.enum";

@Component({
  selector: "hr-not-found-page",
  templateUrl: "./not-found-page.component.html",
  styleUrls: ["./not-found-page.component.scss"],
})
export class NotFoundPageComponent {
  public buttonTypesList = ButtonTypeEnum;

  constructor(private readonly _location: Location) {
  }

  public goBack(): void {
    this._location.back();
  }
}
