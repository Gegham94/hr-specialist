export interface SearchVacancyResultInterface {
  count: number;
  data: SearchVacancyInterface[];
}

export interface SearchVacancyInterface {
  city: string;
  companyAddress: string;
  companyCity: string;
  companyCountry: string;
  companyLogo: string;
  companyName: string;
  conditions: string;
  country: string;
  deadlineDate: string;
  description: string;
  name: string;
  responsibility: string;
  salary: string;
  uuid: string;
  valute: string;
  wayOfWorking: string;
  companyUuid: string;
}

export interface VacancyInterface {
  companyUuid: string;
  name: string;
  description: string;
  responsibility: string;
  conditions: string;
  questions: string;
  deadlineDate: string;
  salary: string;
  searchedSettings: {
    vacancyLevel: string;
    wayOfWorking: string;
    workPlace: string;
  };
  jobRequestSent?: boolean;
}



