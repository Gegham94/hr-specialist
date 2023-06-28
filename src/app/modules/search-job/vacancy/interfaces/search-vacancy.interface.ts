export interface ISearchVacancyResult {
  count: number;
  data: ISearchVacancy[];
}

export interface ISearchVacancy {
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

export interface IVacancy {
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
    workplace: string;
  };
  jobRequestSent?: boolean;
}



