import {UntypedFormGroup, ValidationErrors} from "@angular/forms";


export function formFieldsMustBeNumber(form: UntypedFormGroup): ValidationErrors | null {
  const formValue = form.value;
  const isNumber= Object.values(formValue).every((val)=>Number(val) || val==0);

  if (!isNumber) {
    return { formValueDoesntNumber: true };
  }

  return null;
}
