import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ChatFacade} from "./chat.facade";
import {
  BehaviorSubject, delay,
  finalize,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap, take,
  takeUntil,
  tap
} from "rxjs";
import {IEmployee} from "../../root-modules/app/interfaces/employee.interface";
import {RobotHelperService} from "../../root-modules/app/services/robot-helper.service";
import {Unsubscribe} from "../../shared-modules/unsubscriber/unsubscribe";
import {IConversation} from "./interface/conversations";
import {MessageInterface} from "./interface/chat.interface";
import {NgxIndexedDBService} from "ngx-indexed-db";
import {ChatState} from "./chat.state";
import {LocalStorageService} from "../../root-modules/app/services/local-storage.service";
import {WindowNotificationService} from "../service/window-notification.service";

@Component({
  selector: "hr-my-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent extends Unsubscribe implements OnInit, OnDestroy {
  public throttle = 150;
  public scrollDistance = 2;
  public direction = "";
  public currentPage = 1;
  public message: string = "";
  public employee!: IEmployee;
  public messages$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public employee$!: Observable<IEmployee>;
  public allPagesCount!: number;

  public chatIsShow: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public conversationUuid: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private scrollToIndex$: Subject<MessageInterface[]> = new Subject();
  public isFirst: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  public params = {
    take: 10,
    skip: 0,
  };

  @ViewChild("chat") chat!: ElementRef;
  @ViewChild("infiniteScroll") infiniteScroll!: ElementRef;
  @ViewChild("textarea") textarea!: ElementRef<HTMLTextAreaElement>;

  private allData!: MessageInterface[];
  private allDataCopy!: MessageInterface[];
  private readonly rangeOfMsg: number = 20;
  private currentIndex = 0;
  private start: number = 0;
  private end: number = this.rangeOfMsg;

  private conversations: IConversation[] | null = null;
  public conversations$!: Observable<IConversation[] | null>;
  public selectedConversation$!: Observable<IConversation | null>;
  public conversation: IConversation | null = null;
  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public isMsgLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public isAllowSendMsg: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly _chatFacade: ChatFacade,
    private readonly _chatState: ChatState,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _indexedDbService: NgxIndexedDBService,
    private readonly _localStorage: LocalStorageService,
    private readonly _windowNotificationService: WindowNotificationService,
    private readonly _cdr: ChangeDetectorRef,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.isRobot();
    this.selectedConversation$ = this._chatFacade.getSelectedConversation$()
      .pipe(
        tap((conversation) => {
          if (!!conversation && conversation?.last_message?.conversationUuid) {
            this.conversation = conversation;
            this.updateConversationStatus();
          }
        }),
        shareReplay(1),
      );

    this.conversations$ = this._chatState
      .getConversations$()
      .pipe(tap((conversations) => {
        if (!!conversations) {
          this.conversations = conversations;
        }
      }));

    this._indexedDbService
      .getAll<IEmployee>("resume")
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.isLoading.next(false);
        }),
        switchMap((resumes: IEmployee[]) => {
          this.employee = resumes[0];
          return this._chatFacade.emitGetConversationsRequest(resumes[0]);
        })
      )
      .subscribe();

    this._chatFacade
      .getChatMessages$()
      .pipe(
        delay(500),
        takeUntil(this.ngUnsubscribe),
        tap((data) => {
          this.isMsgLoading.next(false);
          if (this.chatIsShow.value && data?.length) {
            this.scrollToIndex$.next(data);
            this.setMessages(data);
          }
        })
      )
      .subscribe();
  }

  private changeConversationAfterMyMessage(data: MessageInterface[]) {
    if (this.conversations?.length) {
      const index = this.conversations.findIndex(
        (item: { last_message: { conversationUuid: string } }) =>
          (item.last_message.conversationUuid === this.conversation?.last_message.conversationUuid)
      );
      this.conversations[index]["last_message"].message = data[data?.length - 1].message;
      if (typeof data[data?.length - 1].createdAt === "string") {
        this.conversations[index]["last_message"].createdAt =
          data[data?.length - 1].createdAt.toString();
      } else if (data[data?.length - 1].createdAt instanceof Date) {
        this.conversations[index]["last_message"].createdAt =
          data[data?.length - 1].createdAt.toLocaleString();
      }
      this.conversations[index]["last_message"].messageStatus = true;
      this._chatFacade.setConversations(this.conversations);
    }
  }

  public ngAfterViewInit(): void {
    this.scrollToIndex$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap((data: MessageInterface[]) => {
          if (data[data?.length - 1]?.senderUuid === this.conversation?.userTwo) {
            this.changeStatus();
            this.changeConversationAfterMyMessage(data);
          } else {
            if (this.chat.nativeElement.scrollTop + this.chat.nativeElement.clientHeight >=
              this.chat.nativeElement.scrollHeight - 200) {
              this.changeStatus();
              this.chatOpen();
            }
          }

          if (this.isFirst.value || data[data.length - 1].senderUuid === this.employee.uuid) {
            this.chatOpen();
            this.isFirst.next(false);
          }
        })
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
    this._chatFacade.setSelectedConversation(null);
    this._chatFacade.getConversationLastMessageFromCompanyToEmployeeHandler();
    this._chatFacade.destroyGetMessageFromCompanyToEmployeeHandler();
    this._chatFacade.destroyGetConversationsSubscription();
    this._chatFacade.destroyGetMessageIsViewedStatusFromCompanyHandler();
  }

  public onScrollUp() {
    if (this.allData.length - this.currentIndex * this.rangeOfMsg > 0) {
      this.currentIndex++;
      this.end = this.allData.length - this.currentIndex * this.rangeOfMsg;
      this.start =
        this.allData.length - this.currentIndex * this.rangeOfMsg - this.rangeOfMsg < 0
          ? 0
          : this.allData.length - this.currentIndex * this.rangeOfMsg - this.rangeOfMsg;
      const allDataCopy = [...this.allData];
      this.messages$.next([...allDataCopy.slice(this.start, this.end), ...this.messages$.value]);
    }
  }

  public getLogo(logo: string) {
    if (!!logo) {
      return this._chatFacade.getCompanyLogo$(logo);
    }
    return null;
  }

  public scroll(event: any) {
    const element = event.target;
    this._chatFacade
      .getChatMessages$()
      .pipe(takeUntil(this.ngUnsubscribe),
        take(1))
      .subscribe((data) => {
        if (Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 1) {
          if (this.allData.length <= this.rangeOfMsg && data.length !== this.allData.length) {
            this.setMessages(data);
          }
          this.changeStatus();
        }
      });
  }

  public sendMessageAction(): void {
    this._chatFacade.setChatMessage({
      message: this.message,
      role: "employee",
      senderUuid: this.conversation?.userTwo,
      senderFirstName: this.employee?.name || "",
      senderLastName: this.employee?.surname || "",
      recipientUuid: this.conversation?.userOne,
      senderLogo: this.employee?.image || "",
      conversationUuid: this.conversation?.last_message?.conversationUuid,
      createdAt: new Date(),
    });

    this.message = "";
    this.textarea.nativeElement.style.height = "34px";
    setTimeout(() => {
      this.currentIndex = 0;
      this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
    });
  }

  private checkIsAllowSendMsg(conversation: IConversation) {
    if (conversation?.other_info?.interviewStatus === "rejected") {
      this.isAllowSendMsg.next(false);
    } else {
      this.isAllowSendMsg.next(true);
    }
  }

  public getConversationInfoText(conversation: IConversation | null): string {
    if(!!conversation && conversation?.other_info.interviewStatus === "rejected") {
      return "Вы отклонены на эту вакансию";
    } else {
      return "";
    }
  }

  public getConversationMessagesAction(conversation: IConversation): void {
    this.isFirst.next(true);
    this.isMsgLoading.next(true);
    this.checkIsAllowSendMsg(conversation);
    this._chatFacade.setSelectedConversation(conversation);
    this._chatFacade.emitGetConversationMessagesRequest(conversation?.last_message?.conversationUuid);
    this.chatIsShow.next(true);
  }

  public msgLength(): number {
    return this.message?.length;
  }

  public auto_grow() {
    this.textarea.nativeElement.style.height = "34px";
    this.textarea.nativeElement.style.height = `${this.textarea.nativeElement.scrollHeight}px`;
  }

  public onKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey && !!this.message.trim().length) {
      this.sendMessageAction();
      event.preventDefault();
    }
  }

  public chatOpen(): void {
    if (!!this.chat) {
      setTimeout(() => {
        this.currentIndex = 0;
        this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
      });
    }
  }

  private changeStatus(): void {
    if (!this.conversations) {
      return;
    }
    this.updateConversationStatus();
  }

  private setMessages(data: MessageInterface[]): void {
    this.currentIndex = 0;
    this.allData = [...data];
    this.allDataCopy = [...this.allData];

    if (this.allDataCopy.length - this.rangeOfMsg - 1 > 0) {
      this.messages$.next([
        ...this.allDataCopy.splice(this.allDataCopy.length - this.rangeOfMsg - 1, this.allDataCopy.length - 1),
      ]);
    } else {
      this.messages$.next([...this.allDataCopy]);
    }
  }

  private updateConversationStatus(): void {
    if (!this.conversations) {
      return;
    }
    const index = this.conversations.findIndex(
      (item: { last_message: { conversationUuid: string } }) =>
        (item.last_message.conversationUuid === this.conversation?.last_message.conversationUuid)
    );

    if (index > -1 && !this.conversations[index]["last_message"].messageStatus && this.conversation) {
      this.conversations[index]["last_message"].messageStatus = true;
      this.conversation["last_message"].messageStatus = true;
      this._chatFacade.setConversations(this.conversations);
      const unreadConversations = this.conversations.filter(
        (item: { last_message: { messageStatus: boolean } }) => !item?.last_message?.messageStatus
      );

      if (unreadConversations.length) {
        this._chatFacade.setUnreadMessagesCount$(unreadConversations.length);
      } else {
        this._chatFacade.setUnreadMessagesCount$(0);
      }
      this._windowNotificationService.createNotification("", unreadConversations.length);
      if (this.conversation?.last_message?.messageUuid) {
        this._chatFacade.updateConversationMessage(this.conversation?.last_message?.messageUuid, {
          status: true,
        });
      }
    }
  }

  private isRobot(): void {
    if (this._localStorage.getItem("resume")) {
      this.employee$ = of(JSON.parse(this._localStorage.getItem("resume")));
    }

    this.employee$
      .pipe(
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe((data) => {
        const currentPage = data.robot_helper?.find((item: { link: string }) => item.link === "/employee/chat");

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
      });
  }
}
