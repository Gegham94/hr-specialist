import {
  Component,
  ElementRef, EventEmitter,
  Input, OnDestroy,
  OnInit, Output,
  ViewChild
} from "@angular/core";
import {MessageTimeService} from "./message-time.service";
import {filter, takeUntil} from "rxjs";
import Timeout = NodeJS.Timeout;
import {Unsubscribe} from "../../../../shared/unsubscriber/unsubscribe";
import {SignInFacade} from "../../signin/services/signin.facade";

@Component({
  selector: "hr-message-time",
  templateUrl: "./message-time.component.html",
  styleUrls: ["./message-time.component.scss"]
})

export class MessageTimeComponent extends Unsubscribe implements OnInit, OnDestroy {

  @ViewChild("svg") svg!: ElementRef;

  @Input() disabled: boolean = true;
  @Output() getTimeFinish: EventEmitter<boolean> = new EventEmitter<boolean>();
  public timeNumber!: number;
  private interval: number = 0;
  private codeTime: number = 180;
  private step: number = this.codeTime;
  private timeout!: Timeout;

  constructor(
    private _messageTimeService: MessageTimeService,
    private _signInFacade: SignInFacade) {
    super();
  }

  ngOnInit(): void {
    this.sendMessageTime();
    this.sendCodeAgain();
    this.getError();
  }

  private getError(): void {
    this._signInFacade.getErrorMessage()
      .pipe(
        filter((err) => !!err),
        takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.svg.nativeElement.style.display = "block";
        this.timeNumber = this.interval;
      });
  }

  private sendCodeAgain(): void {
    this._messageTimeService.getNewCode().pipe(
      filter((code) => !!code),
      takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.svg.nativeElement.style.display = "block";
        this.step = this.codeTime;
        this.timeNumber = this.codeTime;
        this.sendMessageTime();
      });
  }

  private sendMessageTime(): void {
    this.timeout = setInterval(() => {
      if (this.timeNumber !== this.interval) {
        --this.step;
        this.timeNumber = Number(this.step.toLocaleString("en-US"));
      } else {
        clearInterval(this.timeout);
        this.getTimeFinish.emit(false);
        this.svg.nativeElement.style.display = "none";
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timeout);
    this.unsubscribe();
  }
}
