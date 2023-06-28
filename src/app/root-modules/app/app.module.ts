import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from "@angular/platform-browser";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule, HammerModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Injectable, NgModule } from "@angular/core";

import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { DBConfig, NgxIndexedDBModule } from "ngx-indexed-db";
import * as Hammer from "hammerjs";

import { UiKitViewModule } from "../../ui-kit-view/ui-kit-view.module";
import { AppComponent } from "./component/app.component";
import { AppRoutingModule } from "./app-routing.module";
import { UiModule } from "../../ui-kit/ui.module";
import { SharedModule } from "src/app/shared/shared.module";
import { MonacoEditorModule } from "@materia-ui/ngx-monaco-editor";
import { EmployeeModule } from "../../modules/employee.module";
import { ModalComponent } from "../../modules/modal/modal.component";

@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
  override overrides = <any>{
    swipe: { direction: Hammer.DIRECTION_ALL },
  };
}

export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

const dbConfig: DBConfig = {
  name: "formsDb",
  version: 4,
  objectStoresMeta: [
    {
      store: "forms",
      storeConfig: { keyPath: "id", autoIncrement: false },
      storeSchema: [{ name: "id", keypath: "id", options: { unique: true } }],
    },
    {
      store: "settings",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [{ name: "id", keypath: "id", options: { unique: true } }],
    },
    {
      store: "resume",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [{ name: "id", keypath: "id", options: { unique: true } }],
    },
    {
      store: "compilerTests",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [{ name: "id", keypath: "id", options: { unique: true } }],
    },
    {
      store: "quizTests",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [{ name: "id", keypath: "id", options: { unique: true } }],
    },
  ],
};

@NgModule({
  declarations: [AppComponent, ModalComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    UiModule,
    ReactiveFormsModule,
    FormsModule,
    UiKitViewModule,
    HttpClientModule,
    HammerModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
      isolate: true,
    }),
    NgxIndexedDBModule.forRoot(dbConfig),
    MonacoEditorModule,
    EmployeeModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig,
    },
  ],
})
export class AppModule {}
