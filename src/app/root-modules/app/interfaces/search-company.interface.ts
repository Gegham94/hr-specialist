export interface SearchCompanyResultInterface {
  count: number;
  result: SearchCompanyInterface[];
}

export interface SearchCompanyInterface {
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
  searchedSettings: SearchSettingsInterface;
}

export interface SearchSettingsInterface {
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
