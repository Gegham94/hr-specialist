import {NgModule} from "@angular/core";
import {ChatComponent} from "../chat.component";
import {ChatRoutingModule} from "./chat-routing.module";
import {ChatInputComponent} from "../../../ui-kit/chat-item/chat-input.component";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {UiModule} from "../../../ui-kit/ui.module";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";
import {SharedModule} from "../../../shared/shared.module";
import {ConversationsComponent} from "../components/conversations/conversations.component";
import {MessagesComponent} from "../components/messages/messages.component";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [ChatComponent, ChatInputComponent, ConversationsComponent, MessagesComponent],
  imports: [FormsModule, CommonModule, ChatRoutingModule, UiModule,
    InfiniteScrollModule, NgxSkeletonLoaderModule, SharedModule, TranslateModule],
  exports: [ChatComponent],
})
export class ChatModule {}
