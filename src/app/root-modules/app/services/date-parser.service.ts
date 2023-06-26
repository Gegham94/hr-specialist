import { Injectable } from "@angular/core";
import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

@Injectable({
  providedIn: "root",
})
export class DateParserService {
  constructor(private formatter: NgbDateParserFormatter) {}

  public parseDateToNgbDate(date: string): NgbDateStruct {
    const dateArray = date.split("-");
    const month = parseInt(dateArray[0], 10);
    const day = parseInt(dateArray[1], 10);
    const year = parseInt(dateArray[2], 10);
    return this.formatter.parse(`${year}-${month}-${day}`);
  }

  public ngbDateToString(date: NgbDateStruct): string {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    return `${(jsDate.getMonth() + 1).toString().padStart(2, "0")}-${jsDate.getDate().toString().padStart(2, "0")}-${jsDate
      .getFullYear()
      .toString()
      .padStart(2, "0")}`;
  }
}
