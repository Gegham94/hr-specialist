import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ButtonComponent} from "./button/button.component";
import {InputComponent} from "./input/input.component";
import {RadioComponent} from "./radio/radio.component";
import {SwitcherComponent} from "./switcher/switcher.component";
import {ProgressBarComponent} from "./progress-bar/progress-bar.component";
import {PaginationComponent} from "./pagination/pagination.component";
import {TagComponent} from "./tag/tag.component";
import {ChatInputComponent} from "./chat-input/chat-input.component";
import {NavigateButtonComponent} from "./navigate-button/navigate-button.component";
import {AccordionComponent} from "./accordion/accordion.component";
import {AccordionGroupComponent} from "./accordion-group/accordion-group.component";
import {ListComponent} from "./list/list.component";
import {FormsModule} from "@angular/forms";
import {ClickOutsideModule} from "ng-click-outside";
import {ModalComponent} from "./modal/modal.component";
import {ReactiveFormsModule} from "@angular/forms";
import {ImageCropperModule} from "ngx-image-cropper";
import {NgxMaskModule} from "ngx-mask";
import {CheckboxComponent} from "./checkbox/checkbox.component";
import {RouterModule} from "@angular/router";
import {IconsModule} from "../shared-modules/icons/icons.module";
import {InfiniteScrollModule} from "ngx-infinite-scroll";


import {ShowPasswordComponent} from "../modules/auth/show-password/show-password.component";
import {HrLoaderComponent} from "./hr-loader/hr-loader.component";
import {TooltipModule} from "ng2-tooltip-directive-ng13fix";
import {SliderComponent} from "./slider/slider.component";
import {SearchSelectComponent} from "./search-select/search-select.component";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {DatepickerComponent} from "./datepicker/datepicker.component";
import {NgbDatepickerModule} from "@ng-bootstrap/ng-bootstrap";
import {ToastsComponent} from "./toasts/toasts.component";
import {FileInputComponent} from "./file-input/file-input.component";
import {EmptyContentComponent} from "./empty-content/empty-content.component";
import {SharedModule} from "../shared/shared.module";
import {FilterTabsComponent} from "./filter-tabs/filter-tabs.component";
import {GoBackComponent} from "./go-back/go-back.component";

@NgModule({
  declarations: [
    ButtonComponent,
    InputComponent,
    RadioComponent,
    SwitcherComponent,
    ProgressBarComponent,
    PaginationComponent,
    TagComponent,
    ChatInputComponent,
    NavigateButtonComponent,
    AccordionComponent,
    AccordionGroupComponent,
    ListComponent,
    ModalComponent,
    CheckboxComponent,
    ShowPasswordComponent,
    HrLoaderComponent,
    SearchSelectComponent,
    SliderComponent,
    DatepickerComponent,
    ToastsComponent,
    FileInputComponent,
    EmptyContentComponent,
    FilterTabsComponent,
    GoBackComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ClickOutsideModule,
    ScrollingModule,
    ReactiveFormsModule,
    FormsModule,
    ImageCropperModule,
    NgxMaskModule.forRoot(),
    RouterModule,
    IconsModule,
    InfiniteScrollModule,
    TooltipModule,
    NgbDatepickerModule,
    SharedModule
  ],
  exports: [
    ButtonComponent,
    InputComponent,
    RadioComponent,
    SwitcherComponent,
    ProgressBarComponent,
    PaginationComponent,
    TagComponent,
    ChatInputComponent,
    NavigateButtonComponent,
    AccordionComponent,
    AccordionGroupComponent,
    ListComponent,
    ModalComponent,
    CheckboxComponent,
    ShowPasswordComponent,
    HrLoaderComponent,
    SearchSelectComponent,
    SliderComponent,
    DatepickerComponent,
    ToastsComponent,
    FileInputComponent,
    EmptyContentComponent,
    FilterTabsComponent,
    GoBackComponent
  ],
})
export class UiModule {
}
