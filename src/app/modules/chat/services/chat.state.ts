import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {environment} from "../../../../environments/environment";
import {Message} from "../interface/messages.interface";
import {Conversation, IConversation} from "../interface/conversations.interface";

@Injectable({
  providedIn: "root",
})
export class ChatState {
  private messages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  private conversations$: BehaviorSubject<Conversation[]> = new BehaviorSubject<Conversation[]>([]);
  private selectedConversation$: BehaviorSubject<Conversation | null>
    = new BehaviorSubject<Conversation | null>(null);
  private lastMessageUuid$: BehaviorSubject<string> = new BehaviorSubject("");
  private unreadMessagesCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  private allMessagesCount: BehaviorSubject<number> = new BehaviorSubject(0);

  public getConversations$(): Observable<Conversation[]> {
    return this.conversations$;
  }

  public getConversations(): Conversation[] {
    return this.conversations$.value;
  }

  public setConversations(conversations: Conversation[]): void {
    this.conversations$.next(conversations);
  }

  public getSelectedConversation$(): Observable<Conversation | null> {
    return this.selectedConversation$;
  }

  public getSelectedConversation(): Conversation | null {
    return this.selectedConversation$.value;
  }

  public setSelectedConversation(conversation: Conversation | null): void {
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

  public getChatMessages$(): Observable<Message[]> {
    return this.messages$.asObservable();
  }

  public setChatMessage(message: Message | Message[]): void {
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
