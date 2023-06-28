import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {ToastsService} from "../../shared/services/toasts.service";
import { ToastInterface } from "src/app/shared/interfaces/toast.interface";

@Component({
  selector: "hr-toasts",
  templateUrl: "./toasts.component.html",
  styleUrls: ["./toasts.component.scss"],
  animations: [
    trigger("fadeInOut", [
      state(
        "in",
        style({
          opacity: 1,
          transform: "translateX(0)",
        })
      ),
      transition("void => *", [style({ opacity: 0, transform: "translateX(600px)" }), animate(300)]),
      transition("* => void", [animate(500, style({ opacity: 0, transform: "translateX(600px)" }))]),
    ]),
  ],
})
export class ToastsComponent implements OnInit{

  constructor(private toastService:ToastsService) {  }

  public toasts$!:Observable<ToastInterface[]>;

  ngOnInit(): void {
    this.toasts$=this.toastService.getToast();
  }

  removeToast(){
    this.toastService.removeToast();
  }

}
