import {ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild,} from "@angular/core";
import {ScreenSizeService} from "src/app/root-modules/app/services/screen-size.service";
import {ScreenSizeType} from "src/app/root-modules/app/interfaces/screen-size.type";
import {HeaderFacade} from "../../header.facade";
import {AuthService} from "../../../auth/auth.service";
import {HeaderDropdownsEnum} from "../../constants/header-dropdowns.enum";
import {BehaviorSubject} from "rxjs";
import {
  AddedNewVacancyNotificationItem,
} from "../../interfaces/notifications.interface";
import {InfiniteScrollDirective} from "ngx-infinite-scroll";
import {Unsubscribe} from "../../../../shared-modules/unsubscriber/unsubscribe";
import {SearchParams} from "../../../employee-info/interface/search-params";
import {FormBuilder} from "@angular/forms";
import {NgbCalendar} from "@ng-bootstrap/ng-bootstrap";
import {NotificationData} from "./mock";

@Component({
  selector: "hr-book-interview-notification",
  templateUrl: "./book-interview-notification.component.html",
  styleUrls: ["./book-interview-notification.component.scss"],
})
export class BookInterviewNotificationComponent extends Unsubscribe implements OnDestroy {
  @Input("isMenuOpen") mobile: boolean = false;
  @ViewChild(InfiniteScrollDirective) infiniteScroll!: InfiniteScrollDirective;
  @ViewChild("hourContainer", {static: false}) hourContainer!: ElementRef;

  public notificationData = NotificationData;

  public count!: number;

  public hasNotification: number = this.notificationData.value.count ?? 0;

  public isDropdownOpen$ = this._headerFacade.getStateDropdown$(
    HeaderDropdownsEnum.bookInterviewDate
  );
  public notificationCount: number = 0;
  public currentPage: number = 0;
  public pagination: SearchParams = {take: 0, skip: 0};
  public limit: number = 100;
  public loadingMoreNotifications$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  public isOpenBookingDateModal$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  private requestCount: number = 0;
  public currentStepNote: AddedNewVacancyNotificationItem[] = [];

  get screenSize(): ScreenSizeType {
    return this.screenSizeService.calcScreenSize;
  }

  get virtualContainerHeight(): number {
    return this.screenSize === "DESKTOP" ? 350 : window.innerHeight - 55;
  }

  get virtualScrollItemSize(): number {
    return this.screenSize === "EXTRA_SMALL" ? 45 : 60;
  }

  constructor(
    public readonly calendar: NgbCalendar,
    private readonly formBuilder: FormBuilder,
    private readonly _headerFacade: HeaderFacade,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly screenSizeService: ScreenSizeService,
  ) {
    super();
  }

  public getNextBatch(index: number): void {
    //TODO - Change for added vacancies

    // if (this.currentStepNote.length > 25 && index > this.notificationData.value.length - 25) {
    //   if (this.requestCount === 0) {
    //     this.loadingMoreNotifications$.next(true);
    //     this.currentPage++;
    //     this.requestCount++;
    //     this.getSelectedPaginationValue(this.currentPage);
    //   }
    // }
  }

  public getSelectedPaginationValue(pageNumber: number): void {
    const limit = 100;
    const end = pageNumber * limit;
    this.pagination.skip = end - limit;
    this.pagination.take = this.limit;

    if (this.authService.getToken) {

      //TODO: API integration - Change for added vacancies

      // this.service
      //   .getAddedVacanciesNotifications$(this.pagination)
      //   .pipe(takeUntil(this.ngUnsubscribe), distinctUntilChanged())
      //   .subscribe((note) => {
      //     this.requestCount = 0;
      //     this.currentStepNote = note.result;
      //     this.notificationData.next([...this.notificationData.value, ...note.result]);
      //     this.count = note?.unviewedCount ?? null;
      //     this.hasNotification = note.count;
      //     this.loadingMoreNotifications$.next(false);
      //     this.cdr.detectChanges();
      //   });
    }
  }

  // open / close notification menu
  public openNotificationsListAction(event: Event): void {
    const state = this._headerFacade.getStateDropdown(HeaderDropdownsEnum.bookInterviewDate);
    this._headerFacade.resetDropdownsState(
      HeaderDropdownsEnum.bookInterviewDate,
      state
    );

    //TODO: Open after api integration

    // this.notificationData.next([]);
    // this.loadingMoreNotifications$.next(true);
    // if (!state) {
    //   this.getSelectedPaginationValue(1);
    // }
  }

  public close(event: Event): void {
    event.stopPropagation();
    this._headerFacade.resetDropdownsState(
      HeaderDropdownsEnum.notifications,
      false
    );
  }

  // handle notification select
  public selectNotification(uuid: string): void {

    this.isOpenBookingDateModal$.next(true);

    this._headerFacade.resetDropdownsState(
      HeaderDropdownsEnum.bookInterviewDate,
      false
    );

    // TODO: API integration

    // this.service
    //   .updateViewedNotification$(uuid)
    //   .pipe(
    //     takeUntil(this.ngUnsubscribe),
    //     filter((viewNot) => viewNot["affected"] >= 1)
    //   )
    //   .subscribe(() => {
    //     this.notificationData.value.map((not) => {
    //       if (not.uuid === uuid) {
    //         not.viewed = true;
    //         this.count--;
    //       }
    //     });
    //     // this.cdr.detectChanges();
    //   });
  }

  public closeModal(): void {
    this.isOpenBookingDateModal$.next(false);
  }

  public ngOnDestroy(): void {
    this.isOpenBookingDateModal$.next(false);
    this.unsubscribe();
  }
}
