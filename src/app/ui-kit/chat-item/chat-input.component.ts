import { Component, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "hr-chat-item",
  templateUrl: "./chat-input.component.html",
  styleUrls: ["./chat-input.component.scss"]
})
export class ChatInputComponent {

  public msg: string = "";

  @Output() btnCallBack: EventEmitter<string> = new EventEmitter<string>();

  chatButton() {
    this.btnCallBack.emit(this.msg);
  }

  msgLength() {
    return this.msg?.length;
  }

  constructor() {
  }
}
