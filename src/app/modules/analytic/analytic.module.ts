import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AnalyticRoutingModule} from "./analytic-routing.module";
import {AnalyticsComponent} from "./analytics.component";
import * as echarts from "echarts";
import {NgxEchartsModule} from "ngx-echarts";
import {TranslateModule} from "@ngx-translate/core";
import {UiModule} from "../../ui-kit/ui.module";
import {TestsListComponent} from "./tests-list/tests-list.component";
import {TestComponent} from "./tests-list/test/test.component";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [
    AnalyticsComponent,
    TestsListComponent,
    TestComponent
  ],
  imports: [
    CommonModule,
    AnalyticRoutingModule,
    NgxEchartsModule.forRoot({echarts}),
    TranslateModule,
    UiModule,
    SharedModule
  ]
})
export class AnalyticModule {
}
