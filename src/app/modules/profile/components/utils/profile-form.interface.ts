import { SpecialistGenderEnum, SpecialistGenderTypeEnum } from "src/app/modules/employee-info/enums/specialist-gender.enum";
import { IEmployee } from "src/app/root-modules/app/interfaces/employee.interface";
import { SearchableSelectDataInterface } from "src/app/root-modules/app/interfaces/searchable-select-data.interface";

export interface UserConstructedData {
  userInfo: ProfileInfo,
  userEducation: Education,
  userExperience: Experiences,
  userSkills: Skills
}

export interface IProfileInfo {
  citizenship: string;
  city: string;
  country: string;
  dateOfBirth: string;
  email: string;
  employment: string;
  gender: string;
  image: string;
  name: string;
  phone: string;
  position: string;
  salary: string | null;
  currency: string | null;
  surname: string;
  employee_uuid?: string;
}

export class ProfileInfo implements Partial<IProfileInfo> {
  id: number = 1;
  citizenship: string;
  city: string;
  country: string;
  dateOfBirth: string | undefined = undefined;
  email: string;
  employment: string;
  gender: string;
  image: string;
  name: string;
  phone: string;
  position: string;
  salary: string | null = null;
  currency: string | null = null;
  surname: string;

  constructor(resume: IEmployee) {
    this.citizenship = resume.citizenship;
    this.city = resume.city;
    this.country = resume.country;
    this.email = resume.email;
    this.employment = resume.employment;
    this.gender = resume.gender;
    this.image = resume.image;
    this.name = resume.name;
    this.phone = resume.phone;
    this.position = resume.position;
    this.surname = resume.surname;
  }

  setSalaryAndCurrency(value: string): this {
    if (value) {
      const [salary, currency] = value.split("/");
      this.salary = salary;
      this.currency = currency;
    }
    return this;
  }

  setGenderValue(value: string): this {
    if (value) {
      this.gender = this.gender === SpecialistGenderTypeEnum.Male ? SpecialistGenderEnum.Male : SpecialistGenderEnum.Female
    }
    return this;
  }

  setDateOfBirth(value: string): this {
    if (!value) {
      this.dateOfBirth = "";
      return this;
    }

    const date = new Date(value);
    this.dateOfBirth = date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric"
    }).split("/").join("-");
    return this;
  }
}

export interface IEducation {
  id: number;
  form: IEducationItem;
  savedEducation: IEducationItem[];
}

export interface IEducationItem {
  id?: number;
  education_id: string | SearchableSelectDataInterface[];
  faculty: string | SearchableSelectDataInterface[];
  graduate_date: string;
  trainingFormat: string | SearchableSelectDataInterface[];
  hasNoEducation: boolean;
}

export class Education implements IEducation {
  id: number = 2;
  form: IEducationItem = {
    education_id: [],
    faculty: "",
    graduate_date: "",
    trainingFormat: "",
    hasNoEducation: false,
  };
  savedEducation: IEducationItem[] = [];

  constructor(resume: IEmployee) {
    if (resume.name && !resume.educations.length) {
      this.form.hasNoEducation = true;
    }
    if (resume.educations) {
      resume.educations.forEach((education) => {
        this.savedEducation.push(education);
      });
    }
  }
}

export interface IExperiences {
  id: number;
  form: IWorkExperience;
  savedExperiences: IWorkExperience[];
}

export interface IWorkExperience {
  id?: number;
  accept_date: string;
  company: string;
  position: string;
  quit_date: string;
  stillWorking: boolean;
  hasNoExperience: boolean;
}

export class Experiences implements IExperiences {
  id: number = 3;
  form: IWorkExperience = {
    accept_date: "",
    company: "",
    position: "",
    quit_date: "",
    stillWorking: false,
    hasNoExperience: false,
  };
  savedExperiences: IWorkExperience[] = [];

  constructor(resume: IEmployee) {
    if (resume.name && !resume.experiences.length) {
      this.form.hasNoExperience = true;
    }
    if (resume.experiences) {
      resume.experiences.forEach((experience) => this.savedExperiences.push(experience));
    }
  }
}

export interface IUserSkills {
  id?: number;
  programmingLanguages: string | SearchableSelectDataInterface[];
  programmingFrameworks: string | SearchableSelectDataInterface[];
  languages: string | SearchableSelectDataInterface[];
  languagesFrameworks?: string;
  languagesFrameworksForSelect?: string;
}

export class Skills implements IUserSkills {
  id: number = 4;
  programmingLanguages: string | SearchableSelectDataInterface[] = "";
  programmingFrameworks: string | SearchableSelectDataInterface[] = "";
  languages: string | SearchableSelectDataInterface[] = "";
  languagesFrameworks?: string = "";
  languagesFrameworksForSelect?: string = "";

  constructor(resume: IEmployee) {
    this.languages = resume.languages;
    if (resume.languagesFrameworksForSelect) {
      const languagesAndFrameworks: {
        languages: SearchableSelectDataInterface[];
        frameworks: SearchableSelectDataInterface[];
      } = JSON.parse(resume.languagesFrameworksForSelect);
      this.programmingLanguages = [...languagesAndFrameworks.languages];
      this.programmingFrameworks = [...languagesAndFrameworks.frameworks];
    }
  }
}
