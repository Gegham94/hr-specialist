import {Component, EventEmitter, Input, Output, TemplateRef} from "@angular/core";

@Component({
  selector: "hr-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"],
})
export class ModalComponent {
  private _isOpenProps: boolean = false;

  @Input("isOpen") set isOpenProps(value: boolean) {
    this._isOpenProps = value;
    if (value) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  get isOpenProps(): boolean {
    return this._isOpenProps;
  }

  @Input("width") width!: string;
  @Input("height") height!: string;
  @Input() modalContentTpl!: TemplateRef<any>;
  @Output() whenModalClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  public closeModal() {
    this.isOpenProps = false;
    this.whenModalClose.emit(this.isOpenProps);
  }
}
