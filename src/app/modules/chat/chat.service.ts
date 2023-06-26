import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {MessageInterface} from "./interface/chat.interface";
import {IConversation} from "./interface/conversations";
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

  public getMessageFromCompanyToEmployeeHandler$(): Observable<MessageInterface> {
    return this._chatSocketService.getSocket().fromEvent("getMessageFromCompanyToSpecialist");
  }

  public getConversationLastMessageFromCompanyToEmployeeHandler$() {
    return this._chatSocketService.getSocket().fromEvent("getConversationLastMessageFromCompanyToSpecialist");
  }

  public emitGetConversationsRequest$(specialistUuid: string): Observable<IConversation[] | null> {
    return this._httpClient.get<IConversation[]>(this.GET_EMPLOYEE_CONVERSATION_API, {
      params: {
        specialistUuid
      }
    });
  }

  public getConversationMessagesRequest(
    conversationUuid: string
  ) {
    return this._httpClient.get(this.GET_CONVERSATION_MESSAGES_API, {
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

  public emitSendMessageFromEmployeeToCompany(message: MessageInterface) {
    this._chatSocketService.getSocket().emit("emitSendMessageFromSpecialistToCompany", message);
  }

}
