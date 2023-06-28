import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";
import { Unsubscribe } from "../../shared/unsubscriber/unsubscribe";
import { Subscription } from "rxjs";

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { OnlyLettersRegExp } from "../../shared/constants/const-varibale";
import { InputStatusEnum } from "src/app/shared/constants/input-status.enum";
import { InputTypeEnum } from "src/app/shared/constants/input-type.enum";

@Component({
  selector: "hr-input",
  templateUrl: "./input.component.html",
  styleUrls: ["./input.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: InputComponent,
    },
  ],
})
export class InputComponent extends Unsubscribe implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Output() textInput: EventEmitter<string> = new EventEmitter<string>();
  @Output() blur: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input("label-text") labelTextProps!: string;
  @Input("img-path") imgPath!: string;
  @Input("placeholder-text") placeholderTextProps!: string;
  @Input("feedback-text") feedbackTextProps: string = "";
  @Input("status") statusProps: InputStatusEnum = InputStatusEnum.default;
  @Input("error-status") errorStatus: InputStatusEnum = InputStatusEnum.default;
  @Input("input-disabled") disabled = false;
  @Input("value") valueProps!: string;
  @Input("input-type") inputTypeProps?: string;
  @Input("phone-input") phoneInputProps = false;
  @Input("currency-input") currencyInputProps = false;
  @Input("card-input") cardInputProps = false;
  @Input("date-input") dateInputProps = false;
  @Input("mask-pattern") maskPatternProps = "";
  @Input("prefix") prefix = "";
  @Input() valid?: boolean;
  @Input("show-password") showPassword?: boolean = false;
  @Input("only-letters") onlyLetters?: boolean = false;
  public inputValue: string = "";
  public inputTypeEnum = InputTypeEnum;
  private keyupSub!: Subscription;
  @ViewChild("input") input!: ElementRef<HTMLInputElement>;

  constructor(private cdRef: ChangeDetectorRef) {
    super();
  }

  ngOnDestroy(): void {
    // this.keyupSub.unsubscribe();
  }

  ngAfterViewInit() {
    // this.keyupSub = fromEvent(this.input?.nativeElement, "keyup").subscribe(() => {
    //   this.fileChangeEvent();
    // });
  }

  // public fileChangeEvent(): void {
  //   this.inputValue = this.inputValue ? this.inputValue.toString().trim() : "";
  //   // if (this.inputValue) {
  //   this.textInput.emit(this.inputValue);
  //   this.onChange(this.inputValue);
  //   this.onTouch(this.inputValue);
  //   // }
  // }

  public onInput(event: Event): void {
    if (event && this.onlyLetters) {
      (event.target as HTMLInputElement).value = (event?.target as HTMLInputElement).value.replace(
        OnlyLettersRegExp,
        ""
      );
    }
    if (this.inputValue) {
      this.inputValue = this.inputValue.toString().trim();
      this.textInput.emit(this.inputValue);
      this.onChange(this.inputValue);
      this.onTouch(this.inputValue);
    } else {
      this.inputValue = "";
      this.textInput.emit(this.inputValue);
      this.onChange(this.inputValue);
    }
  }

  public onBlur() {
    this.blur.emit(true);
  }

  public set value(val: string) {
    if (!!val) {
      this.inputValue = val;
    }
  }

  showPasswordValue(event: boolean): void {
    if (event && this.inputTypeProps == this.inputTypeEnum.password) {
      this.inputTypeProps = this.inputTypeEnum.text;
    } else {
      this.inputTypeProps = this.inputTypeEnum.password;
    }
  }

  public get maskChoose(): string {
    if (this.cardInputProps) {
      return "0{4} 0{4} 0{4} 0{4}";
    } else if (this.phoneInputProps) {
      return "(0{3}) 0{3} - 0{2} - 0{2}";
    } else if (this.currencyInputProps) {
      return "separator";
    } else {
      return this.maskPatternProps;
    }
  }

  public onChange: (val: string) => void = (val) => {};

  public onTouch: (val: string) => void = () => {};

  public registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: (val: string) => void): void {
    this.onTouch = fn;
  }

  changePrefix(val: string) {
    if (this.phoneInputProps) {
      this.prefix = "+7";
      this.cdRef.detectChanges();
    } else if (this.currencyInputProps && val) {
      this.prefix = "от  ";
    }
  }

  public writeValue(value: string): void {
    this.inputValue = value;
  }

  public removeInputValue(event: Event): void {
    event.preventDefault();
    this.inputValue = "";
    this.onChange(this.inputValue);
    this.textInput.emit(this.inputValue);
  }
}
