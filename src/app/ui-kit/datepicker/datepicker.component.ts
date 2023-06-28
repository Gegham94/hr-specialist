import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbDatepickerNavigateEvent,
  NgbDateStruct,
  NgbInputDatepicker,
} from "@ng-bootstrap/ng-bootstrap";
import { CustomDatepickerI18n } from "./datepicker-i18n";
import { CustomDateParserFormatter } from "./datepicker-formatter";
import { DateParserService } from "../../shared/services/date-parser.service";
import { map, take, takeUntil, timer } from "rxjs";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";

@Component({
  selector: "hr-datepicker",
  templateUrl: "./datepicker.component.html",
  styleUrls: ["./datepicker.component.scss"],
  providers: [
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerComponent extends Unsubscribe implements OnDestroy {
  @ViewChild("date", { read: ElementRef }) date!: ElementRef;

  public isFormatDate: boolean = false;

  @Input() set default_date(value: string) {
    if (value) {
      this.currentDate = this.formatToNgbDate(value);
    }
  }

  public currentDate!: NgbDateStruct | undefined;
  @Input() disabled: boolean = false;
  @Input() minDate: NgbDateStruct = { year: 1960, month: 1, day: 1 };
  @Input() endDate: NgbDateStruct = { year: 3000, month: 12, day: 1 };
  @Input() isDateOfBirth: boolean = false;
  @Input() valid: boolean | undefined;

  @Output() selectDate: EventEmitter<string> = new EventEmitter<string>();
  @Output() start: EventEmitter<string> = new EventEmitter<string>();

  public isValid?: boolean = undefined;
  public dateBachup: NgbDateStruct | undefined = undefined;

  constructor(private readonly _dateParserService: DateParserService, public readonly cdr: ChangeDetectorRef) {
    super();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  public selectedDate(): void {
    this.isFormatDate = false;
    if (this.currentDate) {
      const formattedDate = this._dateParserService.ngbDateToString(this.currentDate);
      this.selectDate.emit(formattedDate);
    }
  }

  // public close(datePicker: NgbInputDatepicker) {
  //   if (this.dateBachup && this.currentDate) {
  //     this.currentDate = {
  //       ...this.dateBachup,
  //       day: this.currentDate.day
  //     };
  //   }

  //   datePicker.close();
  // }

  public removeInputValue(): void {
    this.date.nativeElement.value = "";
    this.currentDate = undefined;
    this.selectDate.emit("");
    this.cdr.detectChanges();
  }

  public highLightDay(event: NgbDatepickerNavigateEvent, date: any) {
    const day = date._model?.day;
    const month = date._model?.month;
    let childElement: HTMLDivElement;

    this.dateBachup = {
      month: event.next.month,
      year: event.next.year,
      day: date._model?.day,
    };

    timer(0)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        take(1),
        map(() => {
          this.clearHighlight();
          if (event.next.month !== month || event.next.year !== date._model.year) {
            document.querySelectorAll(".ngb-dp-day").forEach((elem) => {
              elem.classList.remove("high-light");
              childElement = elem.firstChild as HTMLDivElement;
              if (childElement.innerText === String(day) && !childElement.classList.contains("text-muted")) {
                elem.classList.add("high-light");
              }
            });
          }
        })
      )
      .subscribe();
  }

  private clearHighlight() {
    document.querySelectorAll(".ngb-dp-day").forEach((elem) => {
      elem.classList.remove("high-light");
    });
  }

  private formatToNgbDate(date: string): NgbDateStruct | undefined {
    return !!date ? this._dateParserService.parseDateToNgbDate(date) : undefined;
  }
}
