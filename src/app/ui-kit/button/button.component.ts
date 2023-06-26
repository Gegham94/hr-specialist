import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ButtonTypeEnum} from "../../root-modules/app/constants/button-type.enum";

@Component({
  selector: "hr-button",
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.scss"],
})
export class ButtonComponent {
  @Input("disabled") disabledProps?: boolean;
  @Input("text") textProps?: string | number;
  @Input("type") typeProps?: ButtonTypeEnum = ButtonTypeEnum.default;
  @Input("prevBtn") prevBtn?: boolean = false;
  @Output() clickEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor() {
  }
}
