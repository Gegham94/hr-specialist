import { Component, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "hr-show-password",
  templateUrl: "./show-password.component.html",
  styleUrls: ["./show-password.component.scss"],
})
export class ShowPasswordComponent {
  public isShowPassword: boolean = true;

  @Output() showPasswordValue = new EventEmitter<boolean>();

  public showPassword(): void {
    this.showPasswordValue.emit(this.isShowPassword);
    this.isShowPassword = !this.isShowPassword;
  }
}
