import {UntypedFormGroup, ValidationErrors} from "@angular/forms";
import {PatternModel} from "../../../modules/auth/enum/pattern.model";

export function CustomValidatorForPassword(form: UntypedFormGroup): ValidationErrors | null {

  const patternModel = PatternModel;


  if (!RegExp(patternModel.pattern).test(form.value.password)) {
    return {
      validPassword:
        "Убедитесь, что пароль состоит не менее чем из восемь символов " +
        "должен быть в верхнем регистре и должен включать элементы цифр," +
        " букв и символов, таких как ! и & "
    };
  }
  else if (form.value.password !== form?.value?.re_password) {
    return {passwordsMustBeEqual: "пароли не совпадают"};
  }

  return null;
}
