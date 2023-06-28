import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {ChatFacade} from "./services/chat.facade";
import {BehaviorSubject, delay, finalize, shareReplay, takeUntil, tap,} from "rxjs";
import {IEmployee} from "../../shared/interfaces/employee.interface";
import {RobotHelperService} from "../../shared/services/robot-helper.service";
import {Unsubscribe} from "../../shared/unsubscriber/unsubscribe";
import {NgxIndexedDBService} from "ngx-indexed-db";
import {Conversation} from "./interface/conversations.interface";
import {IMessage, Message} from "./interface/messages.interface";

@Component({
  selector: "hr-my-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent extends Unsubscribe implements OnInit, OnDestroy {
  public selectedConversation$ = this._chatFacade.getSelectedConversation$().pipe(shareReplay(1));

  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public employee!: IEmployee;

  public isMessagesLoading: boolean = true;

  private _messages: Message[] = [];
  private _conversations: Conversation[] = [];

  public get messages(): Message[] {
    return this._messages;
  }

  public set messages(value: Message[]) {
    this._messages = [...value];
  }

  public get conversations(): Conversation[] {
    return this._conversations;
  }

  public set conversations(value: Conversation[]) {
    this._conversations = [...value];
  }

  constructor(
    private readonly _chatFacade: ChatFacade,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _indexedDbService: NgxIndexedDBService,
    private readonly _cdr: ChangeDetectorRef,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.isRobot();
    this._indexedDbService
      .getAll<IEmployee>("resume")
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.isLoading.next(false);
        }),
        tap((resumes: IEmployee[]) => {
          this.employee = resumes[0];
        })
      )
      .subscribe();

    this.selectedConversation$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedConversation) => {
      if (selectedConversation) {
        this.isMessagesLoading = true;
        this._chatFacade
          .emitGetConversationMessagesRequest(selectedConversation.last_message.conversationUuid)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((messages) => {
            const modifiedMessages = messages
              .filter((message) => message.senderUuid)
              .map((message: IMessage) => {
                const isMyMessage = message.senderUuid === this.employee.uuid;
                return new Message(message).setPosition(isMyMessage);
              });
            this._chatFacade.addChatMessage(modifiedMessages);
          });
        this._cdr.markForCheck();
      }
    });

    this._chatFacade
      .getConversations$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        this.conversations = res;
        this._cdr.markForCheck();
      });

    this._chatFacade
      .getChatMessages$()
      .pipe(takeUntil(this.ngUnsubscribe), delay(200))
      .subscribe((res) => {
        this.messages = res;
        this.isMessagesLoading = false;
        this._cdr.markForCheck();
      });
  }

  private isRobot(): void {
    if (this.employee && this.employee?.robot_helper) {
      const currentPage = this.employee.robot_helper?.find((item: { link: string }) => item.link === "/employee/chat");
      this._robotHelperService.setRobotSettings({
        content: "Chat - helper",
        navigationItemId: null,
        isContentActive: true,
      });
      if (currentPage && !currentPage?.hidden) {
        this._robotHelperService.setRobotSettings({
          content: "Chat",
          navigationItemId: null,
          isContentActive: true,
          uuid: currentPage?.uuid,
        });
        this._robotHelperService.isRobotOpen$.next(true);
      }
    }
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
