import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import {HeaderFacade} from "../../../../header.facade";
import {BehaviorSubject, map, Subject, switchMap, takeUntil, tap, timer} from "rxjs";
import {Unsubscribe} from "../../../../../../shared-modules/unsubscriber/unsubscribe";
import {FormBuilder,} from "@angular/forms";
import {NgbCalendar} from "@ng-bootstrap/ng-bootstrap";
import {BookInterviewInterface} from "../../../../interfaces/book-interview.interface";

@Component({
  selector: "hr-book-interview-date-hours",
  templateUrl: "./book-interview-date-hours.component.html",
  styleUrls: ["./book-interview-date-hours.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookInterviewDateHoursComponent extends Unsubscribe implements AfterViewInit, OnDestroy {
  private retryCountLimit: number = 5;
  private retryCount: number = 0;
  public uniqueId: number = 0;
  private updateNotifier$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private foundNotifier$: Subject<void> = new Subject<void>();
  private countNotifier$: Subject<void> = new Subject<void>();
  public interviewHours!: BookInterviewInterface[];
  @Output() selectedHour: EventEmitter<string> = new EventEmitter<string>();

  @Input() set hours(value: BookInterviewInterface[] | null) {
    if (!value) {
      return;
    }
    const uniqueId = Math.random();
    this.uniqueId = uniqueId;
    const uniqueHours = value.map(hour => ({...hour, uniqueId}));
    this.updateNotifier$.next(uniqueId);
    this.interviewHours = uniqueHours;
  }

  constructor(
    public readonly calendar: NgbCalendar,
    private readonly formBuilder: FormBuilder,
    private readonly _headerFacade: HeaderFacade,
  ) {
    super();
  }

  ngAfterViewInit() {
    this.updateNotifier$.pipe(
      takeUntil(this.countNotifier$),
      tap(() => {
        if (this.retryCountLimit === this.retryCount) {
          this.countNotifier$.next();
          this.countNotifier$.complete();
        }
      }),
      switchMap(() => {
        return timer(300).pipe(
          takeUntil(this.foundNotifier$),
          map(() => {
            const notBooked = document.querySelector(".book-interview-date__modal--hour-isNotBooked");
            if (!notBooked) {
              this.updateNotifier$.next(Math.random());
              this.retryCount++;
            } else {
              if (notBooked.classList.contains(String(this.uniqueId))) {
                notBooked.scrollIntoView({behavior: "smooth", block: "start"});
                this.foundNotifier$.next();
                this.foundNotifier$.complete();
              } else {
                this.updateNotifier$.next(Math.random());
                this.retryCount++;
              }
            }
          })
        );
      })
    ).subscribe();
  }

  public setHour(hour: string): void {
    this.selectedHour.emit(hour);
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

}
