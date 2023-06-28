export interface ISearchCompanyResult {
  count: number;
  result: ISearchCompany[];
}

export interface ISearchCompany {
  name: string;
  address: string;
  city: string;
  country: string;
  uuid?: string;
  logo: string;
  activeVacancyAndSpecialist:ActiveVacancyAndSpecialist;
  vacancyCount: string;
  created?: string;
  description?: string;
  email?: string;
  webSiteLink: string;
  phone: string;
  date?: string;
  status: boolean;
  updatedAt?: string;
  createdAt?: string;
  responsibility?: string;
  payedStatus?: string;
  deadlineDate?: string;
  companyUuid?: string;
  conditions: string;
  searchedSettings: ISearchSettings;
}

export interface ISearchSettings {
  city: string;
  country: string;
  vacancyLevel: string;
  nativeLanguages: [];
  programmingFrameworks: [];
  programmingLanguages: [];
  wayOfWorking: string;
  workplace: string;
}

export interface ActiveVacancyAndSpecialist {
  activeVacancyCount: number;
  specialistCount: number;
}
