import { ISearchableSelectData } from "../interfaces/searchable-select-data.interface";

export enum EmploymentTypeEnum {
  FULLTIME = "Полный рабочий день",
  PARTTIME = "Неполный рабочий день",
  REMOTE = "Гибкий график",
}

export const employmentTypes: ISearchableSelectData[] = [
  {
    id: 1,
    value: EmploymentTypeEnum.FULLTIME,
    displayName: EmploymentTypeEnum.FULLTIME,
  },
  {
    id: 2,
    value: EmploymentTypeEnum.PARTTIME,
    displayName: EmploymentTypeEnum.PARTTIME,
  },
  {
    id: 3,
    value: EmploymentTypeEnum.REMOTE,
    displayName: EmploymentTypeEnum.REMOTE,
  },
];
