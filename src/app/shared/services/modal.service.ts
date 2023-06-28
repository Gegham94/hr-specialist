import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { IModalOld } from "../interfaces/modal.interface";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  public modalContent: BehaviorSubject<IModalOld | null> = new BehaviorSubject<IModalOld | null>(null);
  public resetFileInput: Subject<void> = new Subject<void>();
  public submitCroppedFile: BehaviorSubject<File | null> = new BehaviorSubject<File | null>(null);
  constructor() {}
}
