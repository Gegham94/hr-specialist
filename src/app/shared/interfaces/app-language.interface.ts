export type AppLanguageType = "en" | "ru";

export type II18NDatePickerValues = {
  [key in AppLanguageType]?: II18NDatePickerValue;
};

interface II18NDatePickerValue {
  weekdays: string[];
  months: string[];
}
