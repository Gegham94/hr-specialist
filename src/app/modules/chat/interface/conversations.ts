export interface IConversation {
  last_message: IConversationLastMessage;
  other_info: IOtherInfo;
  company: IConversationSpecialist;
  userOne: string;
  userTwo: string;
}

export interface IOtherInfo {
  foundSpecialistUuid: string;
  interviewStatus: string;
  name: string;
  vacancyUuid: string;
}

export interface IConversationLastMessage {
  conversationStatus: boolean;
  conversationUuid: string;
  createdAt: string;
  message: string;
  messageStatus: boolean;
  messageUuid: string;
  recipientUuid: string;
  senderUuid: string;
}

export interface IConversationSpecialist {
  image: string;
  name: string;
  surname: string;
  uuid: string;
}
