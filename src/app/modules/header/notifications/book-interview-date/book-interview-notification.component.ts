import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { ScreenSizeService } from "src/app/shared/services/screen-size.service";
import { HeaderFacade } from "../../services/header.facade";
import { HeaderDropdownsEnum } from "../../constants/header-dropdowns.enum";
import { BehaviorSubject, distinctUntilChanged, takeUntil, tap } from "rxjs";
import { INotification, INotifications } from "../../interfaces/notifications.interface";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { Unsubscribe } from "../../../../shared/unsubscriber/unsubscribe";
import { NotificationData } from "./mock";
import { DrawerState } from "../../../../ui-kit/drawer/drawer.state";
import { HrModalService } from "../../../modal/hr-modal.service";
import { SearchParams } from "src/app/modules/profile/interfaces/search-params";
import { NotificationsFacade } from "../services/notifications.facade";
import { ScreenSizeType } from "src/app/shared/interfaces/screen-size.type";

@Component({
  selector: "hr-book-interview-notification",
  templateUrl: "./book-interview-notification.component.html",
  styleUrls: ["./book-interview-notification.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookInterviewNotificationComponent extends Unsubscribe implements OnDestroy {
  @ViewChild(InfiniteScrollDirective) infiniteScroll!: InfiniteScrollDirective;
  @ViewChild("hourContainer", { static: false }) hourContainer!: ElementRef;
  @ViewChild("titleTpl", { static: false }) titleTpl!: TemplateRef<any>;
  @ViewChild("contentTpl", { static: false }) contentTpl!: TemplateRef<any>;

  @Input("isMenuOpen") mobile: boolean = false;

  //TODO: Delete after API integration
  public notificationData = NotificationData;

  public notifications!: INotification[];
  public count!: number;
  public hasNotification: number = 0;
  public isDropdownOpen$ = this._headerFacade.getStateDropdown$(HeaderDropdownsEnum.bookInterviewDate);
  public loadingMoreNotifications$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private currentPage: number = 0;
  private pagination: SearchParams = { take: 0, skip: 0 };
  private limit: number = 100;
  private requestCount: number = 0;
  private currentStepNote: INotification[] = [];

  get screenSize(): ScreenSizeType {
    return this._screenSizeService.calcScreenSize;
  }

  get virtualContainerHeight(): number {
    return this.screenSize === "DESKTOP" ? 350 : window.innerHeight - 55;
  }

  get virtualScrollItemSize(): number {
    return this.screenSize === "EXTRA_SMALL" ? 45 : 60;
  }

  constructor(
    private readonly _headerFacade: HeaderFacade,
    private readonly _notificationFacade: NotificationsFacade,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _screenSizeService: ScreenSizeService,
    private readonly _drawerState: DrawerState,
    private readonly _modalService: HrModalService
  ) {
    super();
  }

  public ngOnInit(): void {
    this._notificationFacade
      .getBookInterviewNotifications$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap((notifications) => {
          this.notifications = notifications;
        })
      )
      .subscribe(() => {
        this._cdr.markForCheck();
      });
  }

  public getNextBatch(index: number): void {
    //TODO - Change for added vacancies
    if (this.currentStepNote.length > 25 && index > this.notifications.length - 25) {
      if (this.requestCount === 0) {
        this.loadingMoreNotifications$.next(true);
        this.currentPage++;
        this.requestCount++;
        this.getSelectedPaginationValue(this.currentPage);
      }
    }
  }

  public getSelectedPaginationValue(pageNumber: number): void {
    const end = pageNumber * this.limit;
    this.pagination.skip = end - this.limit;
    this.pagination.take = this.limit;
    //TODO: API integration - Change for added vacancies

    // if (isLogged) {
    this._notificationFacade
      .getBookInterviewNotificationsRequest$(this.pagination)
      .pipe(takeUntil(this.ngUnsubscribe), distinctUntilChanged())
      .subscribe((notifications) => {
        this.setShowedNotificationsData(notifications);
        this.loadingMoreNotifications$.next(false);
        this._cdr.detectChanges();
      });
    // }
  }

  private setShowedNotificationsData(notifications: INotifications): void {
    this.requestCount = 0;
    this.currentStepNote = notifications.result;
    this.count = notifications?.unviewedCount ?? null;
    this.hasNotification = notifications.count;
    this._notificationFacade.setBookInterviewNotifications$([...this.notifications, ...notifications.result]);
  }

  //TODO: Check after api integration
  //open / close notification menu
  public openNotificationsListAction(event: Event): void {
    const state = this._headerFacade.getStateDropdown(HeaderDropdownsEnum.bookInterviewDate);
    this._headerFacade.resetDropdownsState(HeaderDropdownsEnum.bookInterviewDate, state);
    document.documentElement.classList.add("modal-open");
    this._notificationFacade.setBookInterviewNotifications$([]);
    this.loadingMoreNotifications$.next(true);
    if (!state) {
      this.getSelectedPaginationValue(1);
    }
  }

  public close(event: Event): void {
    event.stopPropagation();
    document.documentElement.classList.remove("modal-open");
    this._headerFacade.resetDropdownsState(HeaderDropdownsEnum.bookInterviewDate, false);
  }

  // handle notification select
  public selectNotification(uuid: string): void {
    this._drawerState.setDrawerState(false);
    document.documentElement.classList.remove("modal-open");
    this._modalService.createModal(this.titleTpl, this.contentTpl, null, null);
    this._headerFacade.resetDropdownsState(HeaderDropdownsEnum.bookInterviewDate, false);

    //TODO: Open after api integration

    // this._notificationFacade.updateViewedNotification$(uuid)
    //   .pipe(takeUntil(this.ngUnsubscribe))
    //   .subscribe(() => {
    //     this.changeNotificationStatusByUuid(uuid);
    //     this._cdr.markForCheck();
    //   });
  }

  private changeNotificationStatusByUuid(uuid: string): void {
    const selectedNotification = this.notifications.find((notification) => notification.uuid === uuid);
    if (selectedNotification) {
      selectedNotification.viewed = true;
      this.count--;
    }
  }

  public ngOnDestroy(): void {
    this._drawerState.setDrawerState(false);
    this.unsubscribe();
  }
}
