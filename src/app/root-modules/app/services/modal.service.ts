import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { IModal } from "../interfaces/modal.interface";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  public modalContent: BehaviorSubject<IModal | null> = new BehaviorSubject<IModal | null>(null);
  public resetFileInput: Subject<void> = new Subject<void>();
  public submitCroppedFile: BehaviorSubject<File | null> = new BehaviorSubject<File | null>(null);
  constructor() {}
}
