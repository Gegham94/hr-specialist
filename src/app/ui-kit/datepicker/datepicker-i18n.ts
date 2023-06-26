import { Injectable } from "@angular/core";
import { NgbDatepickerI18n, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { defaultLang, I18N_VALUES } from "src/app/shared/constants/app-language.constants";

@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {
  constructor() {
    super();
  }

  getWeekdayShortName(weekday: number): string {
    const langObject = I18N_VALUES[defaultLang];
    if (langObject) {
      return langObject.weekdays[weekday - 1];
    }
    return "";
  }

  getMonthShortName(month: number): string {
    const langObject = I18N_VALUES[defaultLang];
    if (langObject) {
      return langObject.months[month - 1];
    }
    return "";
  }

  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }
  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }
}
