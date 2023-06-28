import {Injectable} from "@angular/core";
import {ChatState} from "./chat.state";
import {ChatService} from "./chat.service";
import {filter, map, Observable} from "rxjs";
import {IMessage, Message} from "../interface/messages.interface";
import {IEmployee} from "../../../shared/interfaces/employee.interface";
import {Conversation} from "../interface/conversations.interface";

@Injectable({
  providedIn: "root",
})
export class ChatFacade {
  constructor(
    private readonly _chatState: ChatState,
    private readonly _chatService: ChatService,
  ) {
  }

  public getChatMessages$(): Observable<Message[]> {
    return this._chatState.getChatMessages$();
  }

  public setChatMessage(message: Message | Message[]): void {
    this._chatState.setChatMessage(message);
    this._chatService.emitSendMessageFromEmployeeToCompany(message);
  }

  public addChatMessage(message: Message | Message[]): void {
    this._chatState.setChatMessage(message);
  }

  public getMessageFromCompanyToEmployeeHandler$(): Observable<IMessage> {
    return this._chatService.getMessageFromCompanyToEmployeeHandler$();
  }

  public emitGetConversationMessagesRequest(conversationUuid: string): Observable<IMessage[]> {
    return this._chatService.getConversationMessagesRequest(conversationUuid)
      .pipe(
        filter((data) => !!data),
        map(data => data)
      );
  }

  public updateConversationMessage(messageUuid: string, messageData: any) {
    return this._chatService.updateConversationMessage(messageUuid, messageData);

  }

  public getConversations$(): Observable<Conversation[]> {
    return this._chatState.getConversations$();
  }

  public getConversations(): Conversation[] {
    return this._chatState.getConversations();
  }

  public setConversations(conversation: Conversation[]): void {
    this._chatState.setConversations(conversation);
  }

  public getSelectedConversation$(): Observable<Conversation | null> {
    return this._chatState.getSelectedConversation$();
  }

  public getSelectedConversation(): Conversation | null {
    return this._chatState.getSelectedConversation();
  }

  public setSelectedConversation(conversation: Conversation | null): void {
    this._chatState.setSelectedConversation(conversation);
  }

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

  public emitGetConversationsRequest(employee: IEmployee): Observable<Conversation[]> {
    return this._chatService
      .emitGetConversationsRequest$(employee?.uuid)
      .pipe(map((conversations) => {
        const conversationModified = conversations.map(conv => new Conversation(conv));
        const rearranged = this.rearrangeConversation(conversationModified);
        this.setConversations(rearranged || []);
        return rearranged || [];
      }));
  }

  public rearrangeConversation(conversations: Conversation[]): Conversation[] {
    if (!conversations) {
      return [];
    } else if (conversations.length === 1) {
      return conversations;
    }
    const unreadConversations = conversations.filter((conv) => conv.last_message?.messageStatus === false);
    const readConversations = conversations.filter((conv) => conv.last_message?.messageStatus === true);

    const sortedUnreadConversations: Conversation[] =
      unreadConversations.sort((item1, item2) => {
        return new Date(item2.last_message.createdAt).getTime() - new Date(item1.last_message.createdAt).getTime();
      });

    const sortedReadConversations: Conversation[] =
      readConversations.sort((item1, item2) => {
        return new Date(item2.last_message.createdAt).getTime() - new Date(item1.last_message.createdAt).getTime();
      });

    return [...sortedUnreadConversations, ...sortedReadConversations];
  }
}
