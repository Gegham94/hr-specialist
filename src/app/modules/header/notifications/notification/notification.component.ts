import {Unsubscribe} from "../../../../shared/unsubscriber/unsubscribe";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import {NotificationsFacade} from "../services/notifications.facade";
import {HeaderFacade} from "../../services/header.facade";
import {HeaderDropdownsEnum} from "../../constants/header-dropdowns.enum";
import {InfiniteScrollDirective} from "ngx-infinite-scroll";
import {BehaviorSubject, distinctUntilChanged, takeUntil, tap} from "rxjs";
import {INotification, INotifications} from "../../interfaces/notifications.interface";
import {ScreenSizeService} from "src/app/shared/services/screen-size.service";
import { AuthService } from "src/app/modules/auth/service/auth.service";
import { SearchParams } from "src/app/modules/profile/interfaces/search-params";
import { ScreenSizeType } from "src/app/shared/interfaces/screen-size.type";

@Component({
  selector: "hr-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent extends Unsubscribe implements OnInit, OnDestroy {
  @ViewChild(InfiniteScrollDirective) infiniteScroll!: InfiniteScrollDirective;
  @Input("isMenuOpen") mobile: boolean = false;

  public notifications!: INotification[];
  public count!: number;
  public hasNotification: number = 0;
  public isDropdownOpen$ = this._headerFacade.getStateDropdown$(HeaderDropdownsEnum.notifications);
  public loadingMoreNotifications$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private currentPage: number = 0;
  private pagination: SearchParams = {take: 0, skip: 0};
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
    private readonly _notificationFacade: NotificationsFacade,
    private readonly _headerFacade: HeaderFacade,
    private readonly _authService: AuthService,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _screenSizeService: ScreenSizeService
  ) {
    super();
  }

  public ngOnInit(): void {
    this._notificationFacade.getNotifications$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(notifications => {
          this.notifications = notifications;
        })).subscribe(() => {
      this._cdr.markForCheck();
    });
  }

  public getNextBatch(index: number): void {
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
    if (this._authService.getToken) {
      this._notificationFacade.getNotificationsRequest$(this.pagination)
        .pipe(takeUntil(this.ngUnsubscribe), distinctUntilChanged())
        .subscribe((notifications) => {
          this.setShowedNotificationsData(notifications);
          this.loadingMoreNotifications$.next(false);
          this._cdr.detectChanges();
        });
    }
  }

  private setShowedNotificationsData(notifications: INotifications): void {
    this.requestCount = 0;
    this.currentStepNote = notifications.result;
    this.count = notifications?.unviewedCount ?? null;
    this.hasNotification = notifications.count;
    this._notificationFacade.setNotifications$([...this.notifications, ...notifications.result]);
  }

  // open / close notification menu
  public openNotificationsListAction(event: Event): void {
    const state = this._headerFacade.getStateDropdown(HeaderDropdownsEnum.notifications);
    this._headerFacade.resetDropdownsState(
      HeaderDropdownsEnum.notifications,
      state
    );
    this._notificationFacade.setNotifications$([]);
    this.loadingMoreNotifications$.next(true);
    if (!state) {
      this.getSelectedPaginationValue(1);
    }
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
    this._notificationFacade.updateViewedNotification$(uuid)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.changeNotificationStatusByUuid(uuid);
        this._cdr.markForCheck();
      });
  }

  private changeNotificationStatusByUuid(uuid: string): void {
    const notification = this.notifications.find((not) => not.uuid === uuid);
    if (notification) {
      notification.viewed = true;
      this.count--;
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
