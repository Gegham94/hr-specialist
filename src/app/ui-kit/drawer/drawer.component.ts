import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { DrawerState } from "./drawer.state";
import { Unsubscribe } from "../../shared/unsubscriber/unsubscribe";
import { takeUntil } from "rxjs";

@Component({
  selector: "app-drawer",
  templateUrl: "./drawer.component.html",
  styleUrls: ["./drawer.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent extends Unsubscribe implements OnInit, OnDestroy {
  @Input() width: number = 100;
  @Input() isOpen: boolean = false;
  @Input() isScroll: boolean = true;
  @Input() showCloseIcon: boolean = false;
  @Input() padding: number = 30;
  @Input() side: "left" | "right" = "right";
  @Input() useBackdrop: boolean = true;
  @Input() isHeaderDrawer: boolean = false;

  @Output() drawerClosed: EventEmitter<void> = new EventEmitter<void>();

  constructor(private readonly _drawerState: DrawerState) {
    super();
  }

  ngOnInit() {
    this._drawerState
      .getDrawerState$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        if (!data) {
          this.isOpen = false;
          this.drawerClosed.emit();
        }
      });
  }

  public close() {
    this.isOpen = false;
  }

  get drawerStyle() {
    const commonStyles = { width: `${this.width}%` };
    if (this.side == "right") {
      return {
        ...commonStyles,
        right: `${this.isOpen ? 0 : -1 * this.width}%`,
      };
    } else {
      return {
        ...commonStyles,
        left: `${this.isOpen ? 0 : -1 * this.width}%`,
      };
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
  }
}
