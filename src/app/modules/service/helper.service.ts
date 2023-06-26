import {Injectable} from "@angular/core";

@Injectable({
  providedIn:"root"
})

export class HelperService {

  public isObjectValue(objectValue: Object): boolean {
    return Object.values(objectValue).every(value => Boolean(value));
  }
}
