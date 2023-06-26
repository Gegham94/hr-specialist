import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { HeaderDropdownsEnum } from "./constants/header-dropdowns.enum";

@Injectable({
  providedIn: "root"
})
export class HeaderState {
  private readonly chat_dropdown = new BehaviorSubject(false);
  private readonly notifications_dropdown = new BehaviorSubject(false);
  private readonly book_interview_date_dropdown = new BehaviorSubject(false);
  private readonly menu_dropdown = new BehaviorSubject(false);

  public setStateDropdown$(type: HeaderDropdownsEnum, state: boolean): void {
    switch (type){
      case HeaderDropdownsEnum.bookInterviewDate: {
        this.book_interview_date_dropdown.next(state);
        this.notifications_dropdown.next(false);
        this.chat_dropdown.next(false);
        this.menu_dropdown.next(false);
        break;
      }
      case HeaderDropdownsEnum.notifications: {
        this.notifications_dropdown.next(state);
        this.book_interview_date_dropdown.next(false);
        this.chat_dropdown.next(false);
        this.menu_dropdown.next(false);
        break;
      }
      case HeaderDropdownsEnum.menu: {
        this.menu_dropdown.next(state);
        this.chat_dropdown.next(false);
        this.notifications_dropdown.next(false);
        this.book_interview_date_dropdown.next(false);
        break;
      }
      default: {
        this.menu_dropdown.next(false);
        this.chat_dropdown.next(false);
        this.notifications_dropdown.next(false);
        this.book_interview_date_dropdown.next(false);
      }
    }
  }

  public getStateDropdown$(type: HeaderDropdownsEnum): Observable<boolean> {
    switch (type){
      case HeaderDropdownsEnum.notifications: {
        return this.notifications_dropdown.asObservable();
      }
      case HeaderDropdownsEnum.bookInterviewDate: {
        return this.book_interview_date_dropdown.asObservable();
      }
      case HeaderDropdownsEnum.menu: {
        return this.menu_dropdown.asObservable();
      }
      default: {
        return of(false);
      }
    }
  }

  public getStateDropdown(type: HeaderDropdownsEnum): boolean {
    switch (type){
      case HeaderDropdownsEnum.bookInterviewDate: {
        return this.book_interview_date_dropdown.value;
      }
      case HeaderDropdownsEnum.notifications: {
        return this.notifications_dropdown.value;
      }
      case HeaderDropdownsEnum.menu: {
        return this.menu_dropdown.value;
      }
      default: {
        return false;
      }
    }
  }

}
