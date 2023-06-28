import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output,} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {Unsubscribe} from "../../../../../shared/unsubscriber/unsubscribe";
import {FormBuilder, FormGroup, Validators,} from "@angular/forms";
import {NgbCalendar, NgbDate, NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import {GetInterviewCounts, GetInterviewHours} from "../../../../../shared/constants/book-interview-date.contants";
import {BookedDates} from "../mock";
import {IBookInterview} from "../../../interfaces/book-interview.interface";
import {HrModalService} from "../../../../modal/hr-modal.service";

@Component({
  selector: "hr-book-interview",
  templateUrl: "./book-interview.component.html",
  styleUrls: ["./book-interview.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookInterviewComponent extends Unsubscribe implements OnDestroy {
  @Output("close") close: EventEmitter<boolean> = new EventEmitter<boolean>();

  public dateForm: FormGroup = this._formBuilder.group({
    date: ["", [Validators.required]],
    hour: ["", [Validators.required]],
  });

  public maxDate!: NgbDate;
  public todayDate!: NgbDate;
  public interviewHours: BehaviorSubject<IBookInterview[]> = new BehaviorSubject<IBookInterview[]>([]);
  private bookedHours: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  constructor(
    public readonly _calendar: NgbCalendar,
    private readonly _formBuilder: FormBuilder,
    private readonly _modalService: HrModalService,
    private readonly _cdr: ChangeDetectorRef,
  ) {
    super();
    this.maxDate = _calendar.getNext(_calendar.getToday(), "m", 1);
    this.todayDate = _calendar.getToday();
  }

  public ngOnInit(): void {
    this.getStartDate();
  }

  public selectedDate(event: NgbDateStruct): void {
    if (!this.isBooked(event)) {
      this.dateForm.get("hour")?.reset();
      this.dateForm.get("hour")?.updateValueAndValidity({emitEvent: true});
      this.setInterviewHours(event);
    }
  }

  public isBooked = (date: NgbDateStruct): boolean => {
    const day = new Date(date.year, date.month - 1, date.day).getDay();
    const dateString = this.formatDate(date);
    const currentDate = BookedDates.find((booking) => booking.date === dateString);
    const bookedHours = currentDate?.bookedHours.length ?? 0;
    return this.bookedDates().includes(dateString) && bookedHours >= GetInterviewCounts() || day === 0 || day === 6;
  }

  public setInterviewHours(event: NgbDateStruct): void {
    const dateString = this.formatDate(event);
    const currentDate = BookedDates.find((booking) => booking.date === dateString);
    if (currentDate?.bookedHours.length) {
      this.bookedHours.next(currentDate?.bookedHours);
    } else {
      this.bookedHours.next([]);
    }
    this.checkHourState();
  }


  private checkHourState(): void {
    const hours = GetInterviewHours().map(hour => {
      return {
        hour: hour,
        isBooked: this.bookedHours.value.includes(hour),
        isSelected: this.dateForm.get("hour")?.value == hour
      };
    });
    this.interviewHours.next(hours);
  }

  public formatDate(date: NgbDateStruct): string {
    if (date) {
      const year = date.year.toString().padStart(4, "0");
      const month = date.month.toString().padStart(2, "0");
      const day = date.day.toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return "";
  }

  public setHour(hour: string): void {
    this.dateForm.get("hour")?.setValue(hour);
    this.dateForm.get("hour")?.updateValueAndValidity({emitEvent: true});
    this.checkHourState();
  }

  public bookedDates(): string[] {
    return BookedDates.map((booking) => booking.date);
  }

  private getStartDate(): NgbDateStruct {
    const today: NgbDateStruct = this._calendar.getToday();
    if (!this.isBooked(today)) {
      this.dateForm.get("hour")?.reset();
      this.dateForm.get("date")?.setValue(today);
      this.dateForm.updateValueAndValidity({emitEvent: true});
      this.setInterviewHours(today);
      return today;
    } else {
      const previousAvailableDate: NgbDateStruct = this.getPreviousAvailableDate(today);
      if (previousAvailableDate) {
        this.dateForm.get("date")?.setValue(previousAvailableDate);
        this.dateForm.get("date")?.updateValueAndValidity();
        this.dateForm.updateValueAndValidity({emitEvent: true});
        this.setInterviewHours(previousAvailableDate);
        return previousAvailableDate;
      }
    }
    return this._calendar.getToday();
  }

  private getPreviousAvailableDate(date: NgbDateStruct): NgbDateStruct {
    let nextAvailableDay = this.addOneDay(date);
    let isBooked = this.isBooked(nextAvailableDay);
    while (isBooked) {
      nextAvailableDay = this.addOneDay(nextAvailableDay);
      isBooked = this.isBooked(nextAvailableDay);
    }
    return nextAvailableDay;
  }

  private addOneDay(date: NgbDateStruct): NgbDateStruct {
    const ngbDate = NgbDate.from(date);
    const nextDate = this._calendar.getNext(ngbDate, "d", 1);
    return {year: nextDate.year, month: nextDate.month, day: nextDate.day};
  }

  public bookInterview(): void {
    //TODO: send dateForm data to backend
    // console.log(this.dateForm.value);
    this.cancel();
  }

  public cancel(): void {
    this.close.emit(true);
    this._modalService.closeAll();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

}
