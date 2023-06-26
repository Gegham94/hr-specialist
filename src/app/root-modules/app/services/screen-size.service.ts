import { Injectable } from "@angular/core";
import { BehaviorSubject, fromEvent, map, Observable } from "rxjs";
import { ScreenSizeType } from "../interfaces/screen-size.type";
import { BreakpointObserver } from "@angular/cdk/layout";
import { CAROUSEL_HEIGHT, HEADER_HEIGHT, PROGRESS_BAR } from "../constants/layout-size.constant";

@Injectable({
  providedIn: "root",
})
export class ScreenSizeService {
  public profilEditLayoutSize$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  constructor(private readonly breakpointObserver: BreakpointObserver) {}

  public get layoutHeight(): number {
    return window.innerHeight - HEADER_HEIGHT - CAROUSEL_HEIGHT - PROGRESS_BAR - 2;
  }

  public setProfilEditLayoutSize(value: number) {
    this.profilEditLayoutSize$.next(value);
  }

  public readonly layoutHeight$: Observable<number> = fromEvent(window, "resize").pipe(
    map(() => this.layoutHeight)
  );

  public readonly screenSize$: Observable<ScreenSizeType> = fromEvent(window, "resize").pipe(
    map(() => this.calcScreenSize)
  );

  public get calcScreenSize(): ScreenSizeType {
    if (this.breakpointObserver.isMatched("(max-width: 500px)")) {
      return "EXTRA_SMALL";
    } else if (this.breakpointObserver.isMatched("(max-width: 750px)")) {
      return "MOBILE";
    } else {
      return "DESKTOP";
    }
  }
}
