export interface ISearch {
  skip?: number;
  take?: number;
  name?:string;
  address?:string;
  country?:string;
  programmingLanguages?:[];
  programmingFrameworks?:[];
  activeVacancy?:boolean;
  from?: string;
}
