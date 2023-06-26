import {Injectable} from "@angular/core";
import {ChatState} from "./chat.state";
import {ChatService} from "./chat.service";
import {map, Observable, Subscription} from "rxjs";
import {EmployeeInfoFacade} from "../profile/components/utils/employee-info.facade";
import {take, tap} from "rxjs/operators";
import {MessageInterface} from "./interface/chat.interface";
import {IEmployee} from "../../root-modules/app/interfaces/employee.interface";
import {IConversation} from "./interface/conversations";

@Injectable({
  providedIn: "root",
})
export class ChatFacade {
  private destroyGetMessageFromCompanyToEmployeeHandler$: Subscription = new Subscription();
  private destroyGetConversationLastMessageFromCompanyToEmployeeHandler$: Subscription = new Subscription();
  private destroyGetConversationsRequestSubscription$: Subscription = new Subscription();
  private destroyUpdateConversationMessageSubscription$: Subscription = new Subscription();
  private destroyGetConversationMessagesRequestSubscription$: Subscription = new Subscription();
  private destroyGetMessageIsViewedStatusFromCompanyHandler$: Subscription = new Subscription();

  constructor(
    private readonly _chatState: ChatState,
    private readonly _chatService: ChatService,
    private readonly _employeeFacade: EmployeeInfoFacade
  ) {}

  public getChatMessages$(): Observable<MessageInterface[]> {
    return this._chatState.getChatMessages$();
  }

  public setChatMessage(message: any): void {
    this._chatState.setChatMessage(message);
    this._chatService.emitSendMessageFromEmployeeToCompany(message);
  }

  public getMessageFromCompanyToEmployeeHandler$(): Observable<MessageInterface> {
    return this._chatService.getMessageFromCompanyToEmployeeHandler$();
  }

  public getConversationLastMessageFromCompanyToEmployeeHandler$() {
    this.destroyGetConversationLastMessageFromCompanyToEmployeeHandler$ = this._chatService
      .getConversationLastMessageFromCompanyToEmployeeHandler$()
      .subscribe((lastConversation) => {
        this._chatState.updateConversation(lastConversation as IConversation);
      });
  }

  public emitGetConversationMessagesRequest(conversationUuid: string) {
    this.destroyGetConversationMessagesRequestSubscription$ = this._chatService
      .getConversationMessagesRequest(conversationUuid)
      .subscribe((messages: any) => {
        this._chatState.setChatMessage(messages);
        this.destroyGetConversationMessagesRequestSubscription$.unsubscribe();
      });
  }

  public updateConversationMessage(messageUuid: string, messageData: any) {
    this.destroyUpdateConversationMessageSubscription$ = this._chatService
      .updateConversationMessage(messageUuid, messageData)
      .pipe(take(1))
      .subscribe((updatedMessage: any) => {
        // this._chatState.updateConversationStatus(updatedMessage?.conversationUuid, updatedMessage?.status);
        this.destroyUpdateConversationMessageSubscription$.unsubscribe();
      });
  }

  public getMessageIsViewedStatusFromCompanyHandler$() {
    this.destroyGetMessageIsViewedStatusFromCompanyHandler$ = this._chatService
      .getMessageIsViewedStatusFromCompanyHandler$()
      .subscribe((lastMessageUuid: string) => {
        this._chatState.setLastMessageUuid(lastMessageUuid);
      });
  }

  public getConversations$() {
    return this._chatState.getConversations$();
  }

  public getConversations(): IConversation[] | null {
    return this._chatState.getConversations();
  }

  public setConversations(conversation: IConversation[] | null): void {
    this._chatState.setConversations(conversation);
  }

  public getSelectedConversation$() {
    return this._chatState.getSelectedConversation$();
  }

  public setSelectedConversation(conversation: IConversation | null): void {
    this._chatState.setSelectedConversation(conversation);
  }

  // public getCompanies$() {
  //   return this._chatState.getCompanies$();
  // }

  public getCompanyLogo$(logo: string) {
    return this._chatState.getCompanyLogo$(logo);
  }

  public getUnreadMessagesCount$(): Observable<number> {
    return this._chatState.getUnreadMessagesCount$();
  }

  public getUnreadMessagesCount(): number {
    return this._chatState.getUnreadMessagesCount();
  }

  public setUnreadMessagesCount$(count: number) {
    return this._chatState.setUnreadMessagesCount$(count);
  }

  public getAllMessagesCount(): number {
    return this._chatState.getAllMessagesCount$();
  }

  public getLastMessageUuid$() {
    return this._chatState.getLastMessageUuid$();
  }

  public updateConversationStatus(conversationUuid: string, status: boolean): void {
    this._chatState.updateConversationStatus(conversationUuid, status);
  }

  public destroyGetConversationsSubscription() {
    this.destroyGetConversationsRequestSubscription$.unsubscribe();
  }

  public getConversationLastMessageFromCompanyToEmployeeHandler() {
    this.destroyGetConversationLastMessageFromCompanyToEmployeeHandler$.unsubscribe();
  }

  public destroyGetMessageFromCompanyToEmployeeHandler() {
    this.destroyGetMessageFromCompanyToEmployeeHandler$.unsubscribe();
  }

  public destroyGetMessageIsViewedStatusFromCompanyHandler() {
    this.destroyGetMessageIsViewedStatusFromCompanyHandler$.unsubscribe();
  }

  public emitGetConversationsRequest(employee: IEmployee): Observable<IConversation[] | null> {
    return this._chatService
      .emitGetConversationsRequest$(employee?.uuid)
      .pipe(map((conversations) => this.rearrangeConversation(conversations)), tap((conversations) => this.setConversations(conversations)));
  }

  private rearrangeConversation(conversations: IConversation[] | null): IConversation[] | null {
    if (!conversations) {
      return null;
    } else if (conversations.length === 1) {
      return conversations;
    }
    const unreadConversations = conversations.filter((conv) => conv.last_message?.messageStatus === false);
    const readConversations = conversations.filter((conv) => conv.last_message?.messageStatus === true);

    const sortedUnreadConversations: IConversation[] =
      unreadConversations.sort((item1, item2) => {
      return new Date(item2.last_message.createdAt).getTime() - new Date(item1.last_message.createdAt).getTime();
    });

    const sortedReadConversations: IConversation[] =
      readConversations.sort((item1, item2) => {
      return new Date(item2.last_message.createdAt).getTime() - new Date(item1.last_message.createdAt).getTime();
    });

    return [...sortedUnreadConversations, ...sortedReadConversations];
  }
}
