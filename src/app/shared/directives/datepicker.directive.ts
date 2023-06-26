import {Directive, HostListener} from "@angular/core";
import {DatepickerComponent} from "ng2-datepicker";

@Directive({
  selector:"[datePicker]",
})

export class DatepickerDirective {

  constructor(private datepickerComponent:DatepickerComponent) {}

  @HostListener("window:scroll", [])
  onWindowScroll() {
    if (this.datepickerComponent.isOpened) {
      this.datepickerComponent.isOpened=false;
    }
  }

}
