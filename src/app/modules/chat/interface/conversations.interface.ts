export interface IConversation {
  last_message: IConversationLastMessage;
  other_info: IConversationOtherInfo;
  company: IConversationCompany;
  userOne: string;
  userTwo: string;
}

export interface IConversationOtherInfo {
  foundSpecialistUuid: string;
  interviewStatus: string;
  name: string;
  vacancyUuid: string;
}

export interface IConversationLastMessage {
  conversationStatus: boolean;
  conversationUuid: string;
  createdAt: Date | string;
  message: string;
  messageStatus: boolean;
  messageUuid: string;
  recipientUuid: string;
  senderUuid: string;
}

export interface IConversationCompany {
  image: string;
  name: string;
  surname: string;
  uuid: string;
}

export class Conversation implements IConversation {
  last_message!: IConversationLastMessage;
  other_info!: IConversationOtherInfo;
  company!: IConversationCompany;
  userOne!: string;
  userTwo!: string;
  hasUpdate: boolean;

  constructor(conversation: IConversation) {
    Object.assign(this, conversation);
    this.hasUpdate = !conversation.last_message.messageStatus;
  }

  setUpdateStatus(status: boolean): this {
    this.hasUpdate = status;
    this.last_message.messageStatus = !status;
    return this;
  }

  setUpdateLastMessage(
    senderUuid: string,
    message: string,
    messageUuid: string,
    createdAt: Date | string,
    messageStatus = false
  ): this {
    this.last_message.senderUuid = senderUuid;
    this.last_message.message = message;
    this.last_message.messageUuid = messageUuid;
    this.last_message.createdAt = createdAt;
    this.last_message.messageStatus = messageStatus;
    return this;
  }

  setUpdateLastMessageTextAndDate(message: string, createdAt: string): this {
    this.last_message.message = message;
    this.last_message.createdAt = createdAt;
    return this;
  }

}
