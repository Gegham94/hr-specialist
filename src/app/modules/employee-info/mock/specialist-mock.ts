import {SearchableSelectDataInterface} from "../../../root-modules/app/interfaces/searchable-select-data.interface";
import {SpecialistEmployementEnum} from "../enums/specialist-employement.enum";
import {SpecialistGenderEnum} from "../enums/specialist-gender.enum";

export const genders: SearchableSelectDataInterface[] = [
  {id: 0, value: SpecialistGenderEnum.Male, displayName: SpecialistGenderEnum.Male},
  {id: 1, value: SpecialistGenderEnum.Female, displayName: SpecialistGenderEnum.Female}
];

export const price: SearchableSelectDataInterface[] = [
  {id: 0, value: "EUR", displayName: "EUR"},
  {id: 1, value: "RUB", displayName: "RUB"},
  {id: 2, value: "USD", displayName: "USD"}
];

export const employments: SearchableSelectDataInterface[] = [
  {id: 0, value: SpecialistEmployementEnum.FullTime, displayName: SpecialistEmployementEnum.FullTime},
  {id: 1, value: SpecialistEmployementEnum.PartTime, displayName: SpecialistEmployementEnum.PartTime}
];

export const citizenShips: SearchableSelectDataInterface[] = [
  {id: 0, value: "arm", displayName: "Резидент РФ"},
  {id: 1, value: "rus", displayName: "Нерезидент"}
];

export const specialistPosition: SearchableSelectDataInterface[] = [
  {id: 0, value: "intern", displayName: "Практикант"},
  {id: 1, value: "junior", displayName: "Младший"},
  {id: 2, value: "middle", displayName: "Средний"},
  {id: 3, value: "senior", displayName: "Старший"},
  {id: 4, value: "lead", displayName: "Лид"},
];

export const educations: SearchableSelectDataInterface[] = [
  {id: 0, value: "full-time", displayName: "Очная"},
  {id: 1, value: "remote", displayName: "Заочная"}
];

export const faculties: SearchableSelectDataInterface[] = [
  {id: 0, value: "economist", displayName: "Economist"},
  {id: 1, value: "programmer", displayName: "Programmer"}
];

export const languages: { id: string; value: string; displayName: string; }[] = [
  {id: "0", value: "Russian", displayName: "Russian"},
  {id: "1", value: "English", displayName: "English"},
];


