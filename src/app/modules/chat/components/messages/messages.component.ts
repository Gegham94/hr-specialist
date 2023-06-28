import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";

import {BehaviorSubject, finalize, Observable, of, shareReplay, Subject, switchMap, takeUntil, tap} from "rxjs";
import {IMessage, Message} from "../../interface/messages.interface";
import {Conversation} from "../../interface/conversations.interface";
import {ChatFacade} from "../../services/chat.facade";
import {ChatState} from "../../services/chat.state";
import {RobotHelperService} from "../../../../shared/services/robot-helper.service";
import {LocalStorageService} from "../../../../shared/services/local-storage.service";
import {WindowNotificationService} from "../../../service/window-notification.service";
import {NgxIndexedDBService} from "ngx-indexed-db";
import {IEmployee} from "../../../../shared/interfaces/employee.interface";
import {Unsubscribe} from "../../../../shared/unsubscriber/unsubscribe";

@Component({
  selector: "hr-messages",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent extends Unsubscribe implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("chat") chat!: ElementRef;
  @ViewChild("infiniteScroll") infiniteScroll!: ElementRef;
  @ViewChild("textarea") textarea!: ElementRef<HTMLTextAreaElement>;

  @Input() set messages(value: Message[]) {
    this._allMessages = value;
    this.scrollToIndex$.next(value);
  }

  public selectedConversation!: Conversation | null;
  public selectedConversation$ = this._chatFacade.getSelectedConversation$().pipe(shareReplay(1));

  @Input() isLoading: boolean = true;

  private _allMessages!: Message[];

  // TODO: Refactor

  public throttle = 150;
  public scrollDistance = 2;
  public direction = "";
  public currentPage = 1;
  public message: string = "";
  public employee!: IEmployee;
  public messages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  public employee$!: Observable<IEmployee>;
  public allPagesCount!: number;

  public chatIsShow: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public conversationUuid: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private scrollToIndex$: Subject<Message[]> = new Subject();
  public isFirst: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  public params = {
    take: 10,
    skip: 0,
  };

  private allData!: Message[];
  private allDataCopy!: Message[];
  private readonly rangeOfMsg: number = 20;
  private currentIndex = 0;
  private start: number = 0;
  private end: number = this.rangeOfMsg;

  private conversations: Conversation[] | null = null;
  public conversations$!: Observable<Conversation[] | null>;
  public conversation: Conversation | null = null;
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

  onScrollUp() {
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

  public scroll(event: any): void {
    const element = event.target;
    if (Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 1) {
      if (this._allMessages.length !== this.allData.length) {
        const newMessages = this._allMessages.slice(this.allData.length, this._allMessages.length);
        this.messages$.next([...this.messages$.value, ...newMessages]);
        this.allData = this._allMessages;
        this.chatOpen();
      }
      this.changeStatus();
    }
  }

  public ngOnInit(): void {
    this.selectedConversation$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(conversation => {
        this.selectedConversation = conversation;
        this._cdr.markForCheck();
        this.chatOpen();
      });

    this.conversations$ = this._chatState
      .getConversations$()
      .pipe(takeUntil(this.ngUnsubscribe),
        tap((conversations) => {
        if (!!conversations) {
          this.conversations = conversations;
        }
      }));

    this._indexedDbService
      .getAll<IEmployee>("resume")
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.isLoading = false;
        }),
        switchMap((resumes: IEmployee[]) => {
          this.employee = resumes[0];
          return this._chatFacade.emitGetConversationsRequest(resumes[0]);
        })
      )
      .subscribe();
  }

  public ngAfterViewInit(): void {
    this.scrollToIndex$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      const lastData = data[data?.length - 1];
      const isLastDataFromUserTwo = lastData?.senderUuid === this.selectedConversation?.userOne;
      const isScrolledToBottom =
        this.chat.nativeElement.scrollTop + this.chat.nativeElement.clientHeight >=
        this.chat.nativeElement.scrollHeight - 200;
      if (isLastDataFromUserTwo) {
        if (isScrolledToBottom) {
          this.setMessages(data);
          this.changeStatus();
          this.allData = this._allMessages;
          this.chatOpen();
        }
      } else {
        this.setMessages(data);
        this.changeStatus();
        this.allData = this._allMessages;
        this.chatOpen();
      }
    });
  }

  public ngOnDestroy(): void {
    this._chatFacade.setSelectedConversation(null);
    this.unsubscribe();
  }


  public getLogo(logo: string) {
    if (!!logo) {
      return this._chatFacade.getCompanyLogo$(logo);
    }
    return null;
  }

  public sendMessageAction(): void {
    const conversations = this._chatFacade.getConversations();
    const conversation = conversations.find(conversationItem => conversationItem.last_message.conversationUuid
      === this.selectedConversation?.last_message.conversationUuid);

    if (this.selectedConversation && conversation) {
      conversation.setUpdateLastMessageTextAndDate(this.message, new Date().toISOString());
      this._chatFacade.setConversations(conversations);

      const message = new Message({
        message: this.message,
        messageStatus: true,
        role: "employee",
        senderUuid: this.selectedConversation?.userTwo,
        senderFirstName: this.employee?.name || "",
        senderLastName: this.employee?.surname || "",
        recipientUuid: this.selectedConversation?.userOne,
        senderLogo: this.employee?.image || "",
        conversationUuid: this.selectedConversation?.last_message?.conversationUuid,
        createdAt: new Date(),
      }).setPosition(true);

      this._chatFacade.setChatMessage(message);
      this.message = "";
      this.textarea.nativeElement.style.height = "34px";
      setTimeout(() => {
        this.chatOpen();
      });
    }
  }

  private checkIsAllowSendMsg(conversation: Conversation) {
    if (conversation?.other_info?.interviewStatus === "rejected") {
      this.isAllowSendMsg.next(false);
    } else {
      this.isAllowSendMsg.next(true);
    }
  }

  public getConversationInfoText(conversation: Conversation | null): string {
    if (!!conversation && conversation?.other_info.interviewStatus === "rejected") {
      return "Вы отклонены на эту вакансию";
    } else {
      return "";
    }
  }

  public getConversationMessagesAction(conversation: Conversation): void {
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
    this.updateConversationStatus();
  }

  private setMessages(data: Message[]): void {
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
    const conversations = this._chatFacade.getConversations();
    const selectedConversation = conversations.find(conversation => conversation.last_message.conversationUuid
      === this.selectedConversation?.last_message.conversationUuid);
    if (selectedConversation && selectedConversation.last_message.conversationUuid) {
      if (!selectedConversation.last_message.messageStatus) {
        selectedConversation.setUpdateStatus(false);
        this._chatFacade.setSelectedConversation(selectedConversation);
        this._cdr.markForCheck();
        this._chatFacade
          .updateConversationMessage(selectedConversation.last_message?.messageUuid, {
            status: true,
          })
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe();
      }
    }
  }
}
