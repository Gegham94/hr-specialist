import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";

import { TranslateService } from "@ngx-translate/core";
import { Observable, of, takeUntil } from "rxjs";

import { ShowLoaderService } from "../../../ui-kit/hr-loader/show-loader.service";
import { Unsubscribe } from "../../../shared/unsubscriber/unsubscribe";
import { LocalStorageService } from "../../../shared/services/local-storage.service";
import { Languages, defaultLang } from "src/app/shared/constants/app-language.constants";
import { NgxIndexedDBService } from "ngx-indexed-db";

const RESUME_OBJECTSTORE_META = {
  store: "resume",
  storeConfig: { keyPath: "id", autoIncrement: true },
  storeSchema: [{ name: "id", keypath: "id", options: { unique: true } }],
};

@Component({
  selector: "hr-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends Unsubscribe implements OnInit, OnDestroy {
  public isChangeRoute$: Observable<boolean> = of(false);
  private history: string[] = [];

  constructor(
    private _router: Router,
    private _translate: TranslateService,
    private _localStorageService: LocalStorageService,
    private _showLoaderService: ShowLoaderService,
    private _indexedDb: NgxIndexedDBService
  ) {
    super();
    this._translate.addLangs(Languages);
    this._localStorageService.setItem("language", defaultLang);
    this._translate.setDefaultLang(this._localStorageService.getItem("language") ?? defaultLang);
    this._localStorageService.setItem("language", this._localStorageService.getItem("language") ?? defaultLang);
    // this._indexedDb.createObjectStore(RESUME_OBJECTSTORE_META)
  }

  ngOnInit() {
    this.isChangeRoute$ = this._showLoaderService.getIsLoading();
    this._router.events.pipe(takeUntil(this.ngUnsubscribe)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe();
  }
}
