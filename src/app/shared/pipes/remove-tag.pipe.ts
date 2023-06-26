import {Pipe} from "@angular/core";

@Pipe({
  name:"removeTag"
})

export class RemoveTagPipe {
  transform(strInputCode:string | undefined) {
    if (strInputCode){
      return strInputCode.replace(/<\/?[^>]+(>|$)/g, "");
    }
    return "";
  }
}
