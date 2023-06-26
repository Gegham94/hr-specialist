import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { MessageInterface } from "./interface/chat.interface";
import { IConversation } from "./interface/conversations";

@Injectable({
  providedIn: "root",
})
export class ChatState {
  private messages$: BehaviorSubject<MessageInterface[]> = new BehaviorSubject<MessageInterface[]>([]);
  private conversations$: BehaviorSubject<IConversation[] | null> = new BehaviorSubject<IConversation[] | null>(null);
  private selectedConversation$: BehaviorSubject<IConversation | null>
    = new BehaviorSubject<IConversation | null>(null);
  private lastMessageUuid$: BehaviorSubject<string> = new BehaviorSubject("");
  private unreadMessagesCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  private allMessagesCount: BehaviorSubject<number> = new BehaviorSubject(0);

  public getConversations$(): Observable<IConversation[] | null> {
    return this.conversations$;
  }

  public getConversations(): IConversation[] | null {
    return this.conversations$.value;
  }

  public setConversations(conversations: IConversation[] | null): void {
    this.conversations$.next(conversations);
  }

  public getSelectedConversation$() {
    return this.selectedConversation$;
  }

  public setSelectedConversation(conversation: IConversation | null): void {
    this.selectedConversation$.next(conversation);
  }

  public getUnreadMessagesCount$(): Observable<number> {
    return this.unreadMessagesCount$.asObservable();
  }

  public getUnreadMessagesCount(): number {
    return this.unreadMessagesCount$.value;
  }

  public setUnreadMessagesCount$(count: number): void {
    this.unreadMessagesCount$.next(count);
  }

  public getAllMessagesCount$(): number {
    return this.allMessagesCount.value;
  }

  public setAllMessagesCount$(count: number): void {
    this.allMessagesCount.next(count);
  }

  public getCompanyLogo$(logo: File | string): string {
    return `${environment.logo}/company/logo/${logo}`;
  }

  public getLastMessageUuid$() {
    return this.lastMessageUuid$.asObservable();
  }

  public setLastMessageUuid(lastMessageUuid: string): void {
    this.lastMessageUuid$.next(lastMessageUuid);
  }

  public updateConversation(conversation: IConversation): void {
    const currentValue = this.conversations$.getValue();
    if (currentValue) {
      const findConversation = currentValue.find(
        (el) => el["last_message"].conversationUuid === conversation?.last_message?.conversationUuid
      );
      if (findConversation) {
        findConversation["last_message"].message = conversation?.last_message?.message;
        findConversation["userOne"] = conversation?.userOne;
        findConversation.last_message.messageStatus = conversation?.last_message?.messageStatus;
        findConversation["last_message"].messageUuid = conversation?.last_message?.messageUuid;
        findConversation["last_message"].createdAt = conversation?.last_message?.createdAt;
        findConversation["company"].image = conversation?.company?.image;
        findConversation["company"].name = conversation?.company?.name;
      }
    }
  }

  public updateConversationStatus(conversationUuid: string, status: boolean) {
    const conversations = this.conversations$.getValue();
    if (conversations) {
      const findValue = conversations.find(
        (el: { last_message: { conversationUuid: string } }) => el.last_message?.conversationUuid === conversationUuid
      );
      if (findValue && findValue.last_message) {
        findValue["last_message"].messageStatus = status;
      }
    }
  }

  public getChatMessages$(): Observable<MessageInterface[]> {
    return this.messages$.asObservable();
  }

  public setChatMessage(message: MessageInterface): void {
    let currentValue = this.messages$.getValue();
    if (Array.isArray(message)) {
      currentValue = [...message];
      this.messages$.next(currentValue);
      return;
    }

    currentValue.push(message);
    this.messages$.next(currentValue);
  }
}
