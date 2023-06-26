import {Component, EventEmitter, Input, Output, SimpleChanges, TemplateRef} from "@angular/core";

@Component({
  selector: "hr-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"]
})
export class ModalComponent {
  @Input("isOpen") isOpenProps: boolean = false;
  @Input("width") width!: string;
  @Input("height") height!: string;
  @Input() modalContentTpl!: TemplateRef<any>;
  @Output() whenModalClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() {}

  public closeModal() {
    this.isOpenProps = false;
    document.body.style.overflowY = "scroll";
    this.whenModalClose.emit(this.isOpenProps);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpenProps"]?.currentValue) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "scroll";
    }
  }

}
