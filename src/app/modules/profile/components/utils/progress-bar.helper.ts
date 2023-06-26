import { FormGroup } from "@angular/forms";

export class ProgressBarHelper {
  static calcPercent(form: FormGroup): number {
    let value = 0;
    let count = Object.values(form.value).length;
    Object.keys(form.controls).forEach((key) => {
      if (form.controls[key].valid && form.controls[key].value && (key !== "id" && key !== "languages")) {
        value++;
      } 
      if (key === "sumMin" || key === "id" || key === "languages") {
        count -= 1;
      }
    });
    return (value / count) * 100;
  }
}
