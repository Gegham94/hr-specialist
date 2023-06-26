import {
  FilterRecourseProgrammingLanguages
} from "../../../modules/employee-info/interface/filter-recourse-programming-languages.mode";

export type SearchableSelectDataInterfaceOrNull = SearchableSelectDataInterface | null;
export type StringOrNumber = string | number;
export type StringArrayOrNull = string[] | number;

export interface SearchableSelectDataInterface {
  id: StringOrNumber;
  value: string;
  displayName: string;
  count?: number;
  total?: number;
  programmingLanguage?: FilterRecourseProgrammingLanguages;
}
