export interface FilterRecourseProgrammingLanguages {
  uuid?: string;
  joinedName?: string;
  defaultName?: string;
  data?: FilterRecourseProgrammingLanguages[];
  total?: number;
}
export interface FilterRecourseProgrammingFrameworks {
  uuid?: string;
  joinedName?: string;
  defaultName?: string;
  programmingLanguageUuid?: string;
  programming_language?: FilterRecourseProgrammingLanguages;
  data?: FilterRecourseProgrammingFrameworks[];
  total?: number;
}
