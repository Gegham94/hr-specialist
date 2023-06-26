import { Component, ElementRef, Input, OnInit } from "@angular/core";
import { ProgressBarEnum } from "../../root-modules/app/constants/progress-bar.enum";

@Component({
  selector: "hr-progress-bar",
  templateUrl: "./progress-bar.component.html",
  styleUrls: ["./progress-bar.component.scss"],
})
export class ProgressBarComponent implements OnInit {
  @Input("max-value") public maxValueProps: number = 100;
  @Input("value") public valueProps: number = 0;
  @Input("progress-bar-color") public progressBarColorProps: string | undefined = "#26a0fc";
  @Input("type-props") typeProps: ProgressBarEnum = ProgressBarEnum.default;
  @Input("value-direction-top") valueDirectionTop:boolean = false;
  constructor() {}

  public getProgressValue(): string {
    return `${(this.valueProps =
      this.valueProps > this.maxValueProps
        ? this.maxValueProps
        : this.valueProps < 0
        ? 0
        : this.valueProps)}%`;
  }

  ngOnInit(): void {
    this.getProgressValue();
  }
}
