import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {BehaviorSubject, takeUntil} from "rxjs";
import {NavigationEnd, Router} from "@angular/router";
import {LocalStorageService} from "../../root-modules/app/services/local-storage.service";
import {ITabs} from "../../root-modules/app/interfaces/tab-filter.interface";
import {Unsubscribe} from "../../shared-modules/unsubscriber/unsubscribe";


@Component({
  selector: "hr-filter-tabs",
  templateUrl: "./filter-tabs.component.html",
  styleUrls: ["./filter-tabs.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterTabsComponent extends Unsubscribe implements OnInit {
  @Input("tabs") tabs!: ITabs[];
  @Input("localSaveName") localSaveName!: string;
  @Input("defaultActiveTab") defaultActiveTab?: string | null;
  @Output() selectedTab: EventEmitter<string> = new EventEmitter<string>();

  public activeTab: BehaviorSubject<string> = new BehaviorSubject<string>("");

  constructor(
    private readonly router: Router,
    private readonly localStorageService: LocalStorageService
  ) {
    super();
  }

  ngOnChanges() {
    if(this.defaultActiveTab) {
      this.changeTab(this.defaultActiveTab);
    }
  }

  ngOnInit() {
    if (this.localStorageService.getItem(this.localSaveName)) {
      this.activeTab.next(JSON.parse(this.localStorageService.getItem(this.localSaveName)));
      this.changeTab(this.activeTab.value);
    } else {
      this.localStorageService.setItem(this.localSaveName, JSON.stringify(this.tabs[0].value));
      this.changeTab(this.tabs[0].value);
    }
  }

  public changeTab(tab: string): void {
    this.activeTab.next(tab);
    this.localStorageService.setItem(this.localSaveName, JSON.stringify(this.activeTab.value));
    this.selectedTab.emit(tab);
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

}
