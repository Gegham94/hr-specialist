import { Injectable } from "@angular/core";
import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
 */
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = "-";

  // @ts-ignore
  parse(value: string): NgbDateStruct | null {
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ?
      String(date.day).padStart(2, "0") + this.DELIMITER +
      String(date.month).padStart(2, "0") + this.DELIMITER + date.year
      : "";
  }

}
