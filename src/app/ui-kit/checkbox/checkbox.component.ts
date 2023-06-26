import { Component, EventEmitter, Input, Output } from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: "hr-checkbox",
  templateUrl: "./checkbox.component.html",
  styleUrls: ["./checkbox.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CheckboxComponent
    }
  ]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input("checked") checkedProps?: boolean = false;
  @Output() changes: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input("label-text") labelText?: string = "";
  public checkedValue: boolean = false;


  fileChangeEvent(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.checkedValue = !Boolean(value) ? Boolean(value) : !this.checkedValue;
    this.changes.emit(this.checkedValue);
    this.onChange(this.checkedValue);
    this.onTouch(this.checkedValue);
  }

  set value(val: boolean) {
    if (val !== undefined) {
      this.checkedValue = val;
    }
  }

  onChange: (val: boolean) => void = () => {
  }

  onTouch: (val: boolean) => void = () => {
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: (val: boolean) => void): void {
    this.onTouch = fn;
  }

  writeValue(value: boolean): void {
    this.checkedValue = value;
  }

}
