import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import "hammerjs";
import { BehaviorSubject, distinctUntilChanged, Observable, of, takeUntil } from "rxjs";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

import { LocalStorageService } from "../../shared/services/local-storage.service";
import { Unsubscribe } from "../../shared/unsubscriber/unsubscribe";

import {
  robotBgOpacityAnimation,
  robotBlockInfoAnimation,
  robotFadeInOutAnimation,
  robotToastAnimation,
} from "./robot.animations";
import { HomeLayoutFacade } from "../../modules/home-layout/home-layout.facade";
import { RobotHelperService } from "../../shared/services/robot-helper.service";
import { ScreenSizeService } from "../../shared/services/screen-size.service";
import { ScreenSizeType } from "src/app/shared/interfaces/screen-size.type";
import { RobotHelper } from "src/app/shared/interfaces/robot-helper.interface";

@Component({
  selector: "hr-robot-map",
  templateUrl: "./robot-map.component.html",
  styleUrls: ["./robot-map.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [robotFadeInOutAnimation, robotBgOpacityAnimation, robotBlockInfoAnimation, robotToastAnimation],
})
export class RobotMapComponent extends Unsubscribe implements OnDestroy {
  public employee$ = of(JSON.parse(this._localStorage.getItem("resume")));

  public isRobotLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isPolygonLoaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public robotSettings$: Observable<RobotHelper> = this._robotHelperService.getRobotSettings();

  public state: string = "closed";
  public infoState: string = "closed";
  public isRobotOpen$ = this._robotHelperService.isRobotOpen.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
    this.state = "open";
  });

  get screenSizeType(): ScreenSizeType {
    return this.screenSize.calcScreenSize;
  }

  public helperInfo: BehaviorSubject<SafeHtml[]> = new BehaviorSubject<SafeHtml[]>([]);
  public counter: number = 0;

  constructor(
    private readonly _homeLayoutFacade: HomeLayoutFacade,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _localStorage: LocalStorageService,
    private readonly _cdr: ChangeDetectorRef,
    private readonly sanitizer: DomSanitizer,
    private readonly screenSize: ScreenSizeService
  ) {
    super();
    setTimeout(() => {
      this.infoState = "open";
      this._cdr.detectChanges();
    }, 700);

    this.getContent();
  }

  public getContent(): void {
    this.robotSettings$.pipe(takeUntil(this.ngUnsubscribe), distinctUntilChanged()).subscribe((data) => {
      if (data) {
        if (typeof data?.content === "string") {
          this.helperInfo.next([this.sanitizer.bypassSecurityTrustHtml(data.content)]);
        } else {
          const convertedTrustHtmlArr = data.content.map((item) => this.sanitizer.bypassSecurityTrustHtml(item));
          this.helperInfo.next(convertedTrustHtmlArr);
        }
      }
    });
  }

  public isRobotLoaded() {
    this.isRobotLoaded$.next(true);
  }

  public isPolygonLoaded() {
    this.isPolygonLoaded$.next(true);
  }

  public isReadyImages() {
    return this.isRobotLoaded$.value && this.isPolygonLoaded$.value;
  }

  public close() {
    this.state = "closed";
    this.infoState = "closed";
    setTimeout(() => {
      this._homeLayoutFacade.close().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    }, 200);
  }

  public checkForValidSwipe(swipeEvent: any) {
    if (swipeEvent.deltaY >= 80) {
      this.state = "closed";
      this.infoState = "closed";
      setTimeout(() => {
        this.close();
      }, 200);
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
