export interface MessageInterface {
  message: string;
  role: string;
  senderUuid: string;
  senderFirstName: string;
  senderLastName: string;
  recipientUuid: string;
  conversationUuid: string;
  senderLogo: string;
  createdAt: Date | string;
  uuid: string;
}
