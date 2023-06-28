import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from "@angular/core";
import { CompilerTest } from "src/app/shared/interfaces/compiler-tests.interface";
import { ISelectBoxOptions } from "src/app/shared/interfaces/select-box.interface";

@Component({
  selector: "hr-select-box",
  templateUrl: "./select-box.component.html",
  styleUrls: ["./select-box.component.scss"],
})
export class SelectBoxComponent implements OnInit {
  @Input() selectLightMode: boolean | undefined = false;
  @Input() items!: CompilerTest[];
  @Input() options!: ISelectBoxOptions;
  @Input() defaultSelectedTestIndex!: number;

  @Output() setSelectedTestByIndex: EventEmitter<number> = new EventEmitter<number>();

  constructor(private readonly elementRef: ElementRef) {}

  public ngOnInit() {}

  public emitSelectedTest(index: number) {
    this.setSelectedTestByIndex.emit(index);
  }

  public toggleDropdown() {
    this.options.isOpen = !this.options.isOpen;
  }

  @HostListener("document:click", ["$event"])
  public onClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target) && this.options.isOpen) {
      this.options.isOpen = false;
    }
  }
}
