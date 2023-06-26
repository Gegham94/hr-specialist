import {UntypedFormGroup, ValidationErrors} from "@angular/forms";
import {PatternModel} from "../../../modules/auth/enum/pattern.model";

export function ValidateForPassword(form: UntypedFormGroup): ValidationErrors | null {

  const patternModel = PatternModel;

  if (form.value.password == "") {
    return {
      emptyField: "Это поле обязательно для заполнения"
    };
  }

  if (!RegExp(patternModel.pattern).test(form.value.password)) {
    return {
      validPassword:
        "Убедитесь, что пароль состоит не менее чем из восемь символов " +
        "должен быть в верхнем регистре и должен включать элементы цифр," +
        " букв и символов, таких как ! и & "
    };
  }

  return null;
}
