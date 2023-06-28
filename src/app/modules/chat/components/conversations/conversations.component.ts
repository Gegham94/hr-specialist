import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {Unsubscribe} from "../../../../shared/unsubscriber/unsubscribe";
import {Conversation} from "../../interface/conversations.interface";
import {BehaviorSubject, Observable, of, takeUntil} from "rxjs";
import {ChatFacade} from "../../services/chat.facade";
import {WindowNotificationService} from "../../../service/window-notification.service";

@Component({
  selector: "hr-conversations",
  templateUrl: "./conversations.component.html",
  styleUrls: ["./conversations.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationsComponent extends Unsubscribe implements OnInit, OnDestroy {
  @Input() conversations!: Conversation[];

  public throttle = 150;
  public scrollDistance = 2;
  public direction = "";

  public conversations$: Observable<Conversation[]> = of([]);
  public selectedConversation: Conversation | null = null;
  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly _windowNotificationService: WindowNotificationService,
    private readonly _chatFacade: ChatFacade,
    private readonly _cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnInit(): void {
    this._chatFacade
      .getSelectedConversation$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((conversation) => {
        if (!!conversation) {
          this.selectedConversation = conversation;
          this._cdr.markForCheck();
        }
      });
  }

  public showSelectedConversationMessages(conversation: Conversation): void {
    if (!conversation.last_message?.messageStatus) {
      conversation.setUpdateStatus(false);
      this._chatFacade
        .updateConversationMessage(conversation?.last_message?.messageUuid, {
          status: true,
        })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          console.log(this.conversations);
          this._chatFacade.setConversations(this.conversations);
          this.checkUnreadConversations(this.conversations);
        });
    }

    this._chatFacade.setSelectedConversation(conversation);
  }

  private checkUnreadConversations(conversations: Conversation[]): void {
    const unreadConversations = conversations.filter((item) => item.hasUpdate);
    this._windowNotificationService.createNotification("", unreadConversations.length);
  }

  public getLogo(logo: string): string | null {
    if (!!logo) {
      return this._chatFacade.getCompanyLogo$(logo);
    }
    return null;
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

}
