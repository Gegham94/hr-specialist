import { IEducationItem, IWorkExperience } from "src/app/modules/profile/components/utils/profile-form.interface";
import { SearchableSelectDataInterface } from "./searchable-select-data.interface";

// export interface EmployeeInterface {
//   data: any;
//   name: string;
//   surname: string;
//   country: string;
//   city: string;
//   uuid: string;
//   image: string;
//   phone: number;
//   lang: string;
//   skill: string;
//   email: string;
//   gender: string;
//   dateOfBirth: string;
//   citizenship: string;
//   employment: string;
//   workspace: string;
//   experiences: IWorkExperience[];
//   educations: IEducationItem[];
//   languages: [];
//   skills: [];
//   access_token: string;
//   employee_uuid?: string;
//   languagesFrameworksArray: [];
//   languagesFrameworksForSelect: string;
//   languagesFrameworksObjects: string;
//   robot_helper?: Helper[];
//   position: string;
//   salary: string;
//   currency: string;
// }

export interface EducationsModel {
  education_id: [] | string;
  graduate_date: string;
  faculty: [] | string;
  trainingFormat: [] | string;
}

export interface Helper {
  createdAt: string;
  deletedAt: string;
  hidden: boolean;
  link: string;
  toType: string;
  toUuid: string;
  updatedAt: string;
  uuid: string;
}

export interface IEmployee {
  citizenship: string;
  city: string;
  country: string;
  createdAt: string;
  access_token: string;
  dateOfBirth: string;
  educations: IEducationItem[];
  email: string;
  emailVerifiedAt: null;
  employment: string;
  experiences: IWorkExperience[];
  gender: string;
  image: string;
  image_blured: string;
  languages: SearchableSelectDataInterface[];
  languagesFrameworksArray: string;
  languagesFrameworksForSelect: string;
  languagesFrameworksObjects: string;
  name: string;
  oldProfile: null;
  phone: string;
  position: string;
  remember_token: null;
  robot_helper?: Helper[];
  salary: string;
  skype: null;
  surname: string;
  telegram: null;
  updatedAt: string;
  uuid: string;
  whatsApp: null;
  workspace: string;
}
