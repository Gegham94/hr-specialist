import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {ToastInterface} from "../interfaces/toast.interface";
import Timeout = NodeJS.Timeout;

@Injectable({
  providedIn: "root"
})

export class ToastsService {

  // @ts-ignore
  private toasts: BehaviorSubject<ToastInterface[]> = new BehaviorSubject([]);
  private timeout!: Timeout;

  public addToast(message: ToastInterface, duration: number = 3000): void {
    this.toasts.next([message]);
    this.timeout = setTimeout(() => {
      this.removeToast();
    }, duration);
  }

  public getToast(): Observable<ToastInterface[]> {
    return this.toasts.asObservable();
  }

  public removeToast() {
    this.toasts.next([]);
    clearTimeout(this.timeout);
  }
}
