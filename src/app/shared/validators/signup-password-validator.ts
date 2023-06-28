import {UntypedFormGroup, ValidationErrors} from "@angular/forms";
import {PatternModelEnum} from "../../modules/auth/enum/pattern.model";

export function ValidateForPassword(control: UntypedFormGroup): ValidationErrors | null {

  const patternModel = PatternModelEnum;

  if (control.value == "") {
    return {
      emptyField: "Это поле обязательно для заполнения"
    };
  }

  if (!RegExp(patternModel.pattern).test(control.value)) {
    return {
      validPassword:
        "Убедитесь, что пароль состоит не менее чем из восемь символов " +
        "должен быть в верхнем регистре и должен включать элементы цифр," +
        " букв и символов, таких как ! и & "
    };
  }

  return null;
}
