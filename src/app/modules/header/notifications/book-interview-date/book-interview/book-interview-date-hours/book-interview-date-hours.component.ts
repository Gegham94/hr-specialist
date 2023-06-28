import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import {IBookInterview} from "../../../../interfaces/book-interview.interface";

@Component({
  selector: "hr-book-interview-date-hours",
  templateUrl: "./book-interview-date-hours.component.html",
  styleUrls: ["./book-interview-date-hours.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookInterviewDateHoursComponent {
  public interviewHours!: IBookInterview[];
  @Output() selectedHour: EventEmitter<string> = new EventEmitter<string>();

  @Input() set hours(value: IBookInterview[] | null) {
    if (!value) {
      return;
    }
    this.interviewHours = value;
    this._cdr.markForCheck();
  }

  constructor(private readonly _cdr: ChangeDetectorRef) {}

  public setHour(hour: string): void {
    this.selectedHour.emit(hour);
  }
}
