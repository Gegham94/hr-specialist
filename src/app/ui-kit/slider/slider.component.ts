import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2, TemplateRef,
} from "@angular/core";
import {SafeHtml} from "@angular/platform-browser";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {ChatFacade} from "../../modules/chat/chat.facade";
import {ObjectType} from "../../shared-modules/types/object.type";
import {EmployeeInfoFacade} from "../../modules/profile/components/utils/employee-info.facade";

@Component({
  selector: "hr-slider",
  templateUrl: "./slider.component.html",
  styleUrls: ["./slider.component.scss"],
  animations: [
    trigger("fade", [
      state("void", style({opacity: 0})),
      transition("void <=> *", [animate("1s ease-in-out")])
    ]),
  ]
})
export class SliderComponent {
  @Input() public helperInfo!: SafeHtml[] | TemplateRef<any>[];
  @Input() public specialist!: ObjectType;
  @Input() public isTemplateRef: boolean = false;
  /** Если нужно, чтобы кнопки слайдера были под контентом, передать true */
  @Input() public controlsUnder: boolean = false;
  /** Если нужно, чтобы контент был сцентрирован по вертикали, передать true*/
  @Input() public centerContent: boolean = false;
  @Output() public isOpenChat: EventEmitter<boolean> = new EventEmitter();

  public counter: number = 0;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly renderer2: Renderer2,
    private readonly _chatFacade: ChatFacade,
    private readonly _employeeFacade: EmployeeInfoFacade
  ) {
    this.scrollTo("step1");
  }

  public next(i: number): void {
    if (this.counter < this.helperInfo.length - 1) {
      this.counter += 1;
    }
    this.scrollTo("step" + (i+2));
  }

  public prev(i: number): void {
    if (this.counter >= 1) {
      this.counter = this.counter - 1;
    }
    this.scrollTo("step" + i);
  }

  public scrollTo(ref: string) {
    this._employeeFacade.setSelectedContentReference(ref);
  }

  // tslint:disable-next-line:no-any
  public get templateRefs(): TemplateRef<any>[] {
    // tslint:disable-next-line:no-any
    return this.helperInfo as TemplateRef<any>[];
  }

}
