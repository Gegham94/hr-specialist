import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { Observable, takeUntil } from "rxjs";
import { AccordionComponent } from "../accordion/accordion.component";
import { Unsubscribe } from "src/app/shared-modules/unsubscriber/unsubscribe";

@Component({
  selector: "hr-accordion-group",
  templateUrl: "./accordion-group.component.html",
  styleUrls: ["./accordion-group.component.scss"],
})
export class AccordionGroupComponent extends Unsubscribe implements AfterViewInit, OnDestroy {
  @ContentChildren(AccordionComponent)
  public accordionList!: QueryList<AccordionComponent>;
  constructor(private _el: ElementRef) {super()}

  ngAfterViewInit(): void {
    this.accordionList.forEach((accordions: AccordionComponent, index: number) => {
      accordions.accordionState$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.accordionList.forEach((accordionsInner: AccordionComponent, indexInner: number) => {
          if (indexInner !== index) { accordionsInner.setAccordionState = false; }
        });
        this.accordionList.get(index)!.setAccordionState = !this.accordionList.get(index)!.getAccordionState;
      });
    });
  }

  ngOnDestroy(): void {
      this.unsubscribe();
  }
}
