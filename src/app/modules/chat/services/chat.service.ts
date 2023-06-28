import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {IMessage, Message} from "../interface/messages.interface";
import {Conversation} from "../interface/conversations.interface";
import {SocketService} from "./socket.service";

@Injectable({
  providedIn: "root"
})
export class ChatService {

  private readonly GET_EMPLOYEE_CONVERSATION_API = `${environment.chatUrl}/chat/conversation/specialist`;
  private readonly GET_CONVERSATION_MESSAGES_API = `${environment.chatUrl}/chat/messages/specialist`;
  private readonly UPDATE_EMPLOYEE_CONVERSATION_API = `${environment.chatUrl}/chat/conversation`;

  constructor(
    private readonly _chatSocketService: SocketService,
    private readonly _httpClient: HttpClient
  ) {
  }

  public getMessageFromCompanyToEmployeeHandler$(): Observable<IMessage> {
    return this._chatSocketService.getSocket().fromEvent("getMessageFromCompanyToSpecialist");
  }

  public getConversationLastMessageFromCompanyToEmployeeHandler$() {
    return this._chatSocketService.getSocket().fromEvent("getConversationLastMessageFromCompanyToSpecialist");
  }

  public emitGetConversationsRequest$(specialistUuid: string): Observable<Conversation[]> {
    return this._httpClient.get<Conversation[]>(this.GET_EMPLOYEE_CONVERSATION_API, {
      params: {
        specialistUuid
      }
    });
  }

  public getConversationMessagesRequest(conversationUuid: string): Observable<IMessage[]> {
    return this._httpClient.get<IMessage[]>(this.GET_CONVERSATION_MESSAGES_API, {
      params: {conversationUuid}
    });
  }

  public getMessageIsViewedStatusFromCompanyHandler$(): Observable<string> {
    return this._chatSocketService.getSocket().fromEvent("getMessageIsViewedStatusFromCompany");
  }

  public updateConversationMessage(messageUuid: string, messageData: any) {
    return this._httpClient.put(this.UPDATE_EMPLOYEE_CONVERSATION_API, {
      messageUuid,
      messageData
    });
  }

  public emitSendMessageFromEmployeeToCompany(message: Message | Message[]) {
    this._chatSocketService.getSocket().emit("emitSendMessageFromSpecialistToCompany", message);
  }

}
