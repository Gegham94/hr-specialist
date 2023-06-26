import {NgModule} from "@angular/core";
import {ChatComponent} from "./chat.component";
import {ChatRoutingModule} from "./chat-routing.module";
import {ChatInputComponent} from "../../ui-kit/chat-item/chat-input.component";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {UiModule} from "../../ui-kit/ui.module";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";
import {SharedModule} from "../../shared/shared.module";

@NgModule({
  declarations: [ChatComponent, ChatInputComponent],
  imports: [FormsModule, CommonModule, ChatRoutingModule, UiModule,
    InfiniteScrollModule, NgxSkeletonLoaderModule, SharedModule],
  exports: [ChatComponent],
})
export class ChatModule {}
