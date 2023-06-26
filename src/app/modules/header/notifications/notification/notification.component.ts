import { Unsubscribe } from "../../../../shared-modules/unsubscriber/unsubscribe";
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  Input,
  ViewChild,
} from "@angular/core";
import { NotificationsFacade } from "../notifications.facade";
import { HeaderFacade } from "../../header.facade";
import { HeaderDropdownsEnum } from "../../constants/header-dropdowns.enum";
import { NotificationsService } from "../notifications.service";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { BehaviorSubject, distinctUntilChanged, filter, takeUntil } from "rxjs";
import { SearchParams } from "../../../employee-info/interface/search-params";
import { GlobalNotificationItem } from "../../interfaces/notifications.interface";
import { AuthService } from "../../../auth/auth.service";
import { ScreenSizeService } from "src/app/root-modules/app/services/screen-size.service";
import { ScreenSizeType } from "src/app/root-modules/app/interfaces/screen-size.type";

@Component({
  selector: "hr-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
})
export class NotificationComponent extends Unsubscribe implements OnDestroy {
  @Input("isMenuOpen") mobile: boolean = false;
  @ViewChild(InfiniteScrollDirective) infiniteScroll!: InfiniteScrollDirective;

  public notificationData: BehaviorSubject<GlobalNotificationItem[]> = new BehaviorSubject<GlobalNotificationItem[]>([]);
  public count!: number;
  public hasNotification: number = 0;
  public isDropdownOpen$ = this._headerFacade.getStateDropdown$(
    HeaderDropdownsEnum.notifications
  );
  public notificationCount: number = 0;
  public currentPage: number = 0;
  public pagination: SearchParams = { take: 0, skip: 0 };
  public limit: number = 100;
  public loadingMoreNotifications$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  private requestCount: number = 0;
  public currentStepNote: GlobalNotificationItem[] = [];

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
    private _notificationFacade: NotificationsFacade,
    private _headerFacade: HeaderFacade,
    private service: NotificationsService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private screenSizeService: ScreenSizeService
  ) {
    super();
  }

  public getNextBatch(index: number): void {
    if (this.currentStepNote.length > 25  && index > this.notificationData.value.length - 25) {
      if (this.requestCount === 0) {
        this.loadingMoreNotifications$.next(true);
        this.currentPage++;
        this.requestCount++;
        this.getSelectedPaginationValue(this.currentPage);
      }
    }
  }

  public getSelectedPaginationValue(pageNumber: number): void {
    const limit = 100;
    const end = pageNumber * limit;
    const start = end - limit;

    this.pagination.skip = start;
    this.pagination.take = this.limit;
    if (this.authService.getToken) {
      this.service
        .getGlobalNotification$(this.pagination)
        .pipe(takeUntil(this.ngUnsubscribe), distinctUntilChanged())
        .subscribe((note) => {
          this.requestCount = 0;
          this.currentStepNote = note.result;
          this.notificationData.next([...this.notificationData.value, ...note.result]);
          this.count = note?.unviewedCount ?? null;
          this.hasNotification = note.count;
          this.loadingMoreNotifications$.next(false);
          this.cdr.detectChanges();
        });
    }
  }

  // open / close notification menu
  public openNotificationsListAction(event: Event): void {
    const state = this._headerFacade.getStateDropdown(HeaderDropdownsEnum.notifications);
    this._headerFacade.resetDropdownsState(
      HeaderDropdownsEnum.notifications,
      state
    );
    this.notificationData.next([]);
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
    this.service
      .updateViewedNotification$(uuid)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((viewNot) => viewNot["affected"] >= 1)
      )
      .subscribe(() => {
        this.notificationData.value.map((not) => {
          if (not.uuid === uuid) {
            not.viewed = true;
            this.count--;
          }
        });
        // this.cdr.detectChanges();
      });
  }

  public ngOnDestroy() {
    this.unsubscribe();
  }

  private vacanciesPagesCount(count: number): void {
    this.notificationCount = Math.ceil(count / this.limit);
  }
}
