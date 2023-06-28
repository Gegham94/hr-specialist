import { Component } from "@angular/core";
import { Router } from "@angular/router";
import {ButtonTypeEnum} from "../../../shared/constants/button-type.enum";

@Component({
  selector: "hr-no-access-error",
  templateUrl: "./no-access-error.component.html",
  styleUrls: ["./no-access-error.component.scss"]
})
export class NoAccessErrorComponent {
  public buttonTypesList = ButtonTypeEnum;

  constructor(private readonly _router: Router) {
  }

  public goBack(): void {
  this._router.navigateByUrl("/employee/resume");
  }
}
