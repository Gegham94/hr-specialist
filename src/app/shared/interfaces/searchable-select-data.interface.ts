import { FilterRecourseProgrammingLanguages } from "src/app/modules/profile/interfaces/filter-recourse-programming-languages.mode";

export type SearchableSelectDataInterfaceOrNullType = ISearchableSelectData | null;
export type StringOrNumberType = string | number;
export type StringArrayOrNullType = string[] | number;

export interface ISearchableSelectData {
  id: StringOrNumberType;
  value: string;
  displayName: string;
  count?: number;
  total?: number;
  programmingLanguage?: FilterRecourseProgrammingLanguages;
}
