import { AppLanguageType, II18NDatePickerValues } from "../interfaces/app-language.interface";

export const Languages: AppLanguageType[] = ["ru", "en"];
export const [defaultLang] = Languages;

export const I18N_VALUES: II18NDatePickerValues = {
    ru: {
      weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      months: [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
      ],
    },
  };