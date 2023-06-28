import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { LocalStorageService } from "../../shared/services/local-storage.service";
import { ITabs } from "src/app/shared/interfaces/tab-filter.interface";

@Component({
  selector: "hr-filter-tabs",
  templateUrl: "./filter-tabs.component.html",
  styleUrls: ["./filter-tabs.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterTabsComponent implements OnInit {
  @Input("tabs") tabs!: ITabs[];
  @Input("localSaveName") localSaveName!: string;
  @Input("defaultActiveTab") defaultActiveTab?: string | null;
  @Output() selectedTab: EventEmitter<string> = new EventEmitter<string>();

  public activeTab: BehaviorSubject<string> = new BehaviorSubject<string>("");

  constructor(private readonly localStorageService: LocalStorageService) {}

  ngOnChanges() {
    if (this.defaultActiveTab) {
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
}
