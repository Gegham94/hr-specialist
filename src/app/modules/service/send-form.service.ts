import {Injectable} from "@angular/core";
import {EmployeeInfoFacade} from "../profile/services/employee-info.facade";
import {DateFormatEnum} from "../profile/enums/date-format.enum";
import {formatDate} from "@angular/common";
import {
  EducationsModel,
  EmployeeInterface,
  ExperienceModel
} from "../../shared/interfaces/employee.interface";
import {UntypedFormGroup} from "@angular/forms";
import {HelperService} from "./helper.service";
import {SpecialistGenderEnum, SpecialistGenderTypeEnum} from "../profile/enums/specialist-gender.enum";

@Injectable({
  providedIn: "root"
})

export class SendFormService {

  constructor(private _employeeFacade: EmployeeInfoFacade, private helperService: HelperService) {
  }

  public mappingFormValueBeforeSend(
    form: UntypedFormGroup,
    employee: EmployeeInterface,
    skillLang?: [],
    educationIsAdded?: boolean,
    workExperienceIsAdded?: boolean): EmployeeInterface[] {

    const dateFormat = DateFormatEnum;
    const experience = form.get("experiences")?.value;
    const education = form.get("educations")?.value;

    const formData: any = new FormData();

    const specialistExperience = experience
      .filter((workExps: Object) => workExperienceIsAdded && this.helperService.isObjectValue(workExps))
      .map((workExp: ExperienceModel) => {
        if (workExp.work_yet) {
          return ({
            company: workExp.company,
            position: workExp.position,
            work_yet: workExp.work_yet
          });
        } else {
          return ({
            company: workExp.company,
            position: workExp.position,
            accept_date: formatDate(workExp.accept_date, dateFormat.date, "en-US"),
            quit_date: formatDate(workExp.quit_date, dateFormat.date, "en-US"),
          });
        }
      });

    const specialistEducation = education
      .filter((s: Object) => educationIsAdded && this.helperService.isObjectValue(s))
      .map((s: EducationsModel, index: number) => ({
        education_id: s.education_id[index]["displayName"] ? s.education_id[index]["displayName"] : s.education_id,
        graduate_date: formatDate(s.graduate_date[index], dateFormat.date, "en-US"),
        faculty: s.faculty[index]["displayName"] ? s.faculty[index]["displayName"] : s.faculty,
        trainingFormat: s.trainingFormat[index]["displayName"]
          ? s.trainingFormat[index]["displayName"] : s.trainingFormat
      }));

    const formValue = form.getRawValue();

    formValue.gender = formValue.gender[0].displayName === SpecialistGenderEnum.Male
      ? SpecialistGenderTypeEnum.Male : SpecialistGenderTypeEnum.Female;

    formData.append("employee_uuid", (employee?.uuid || employee?.employee_uuid));
    formData.append("name", formValue.name);
    formData.append("surname", formValue.surname);
    formData.append("email", formValue.email);
    formData.append("dateOfBirth", formatDate(formValue.dateOfBirth, dateFormat.date, "en-US"));
    formData.append("gender", formValue.gender);
    formData.append("experiences", JSON.stringify(specialistExperience));
    formData.append("educations", JSON.stringify(specialistEducation));
    formData.append("languages", JSON.stringify(formValue.languages === "" ? [] : formValue.languages));
    formData.append("image", formValue.image);
    formData.append("phone", formValue.phone);
    formData.append("position",
      formValue.position[0].displayName ? formValue.position[0].displayName : formValue.position
    );
    formData.append("languagesFrameworks", JSON.stringify(skillLang));

    formData.append("citizenship",
      formValue.citizenship[0].displayName ? formValue.citizenship[0].displayName : formValue.citizenship);

    formData.append("city",
      formValue.city[0].displayName ? formValue.city[0].displayName : formValue.city);

    formData.append("salary",
      formValue.salary.concat(formValue.currency[0].displayName ? formValue.currency[0].displayName : formValue.currency));


    formData.append("country",
      formValue.country[0].displayName ? formValue.country[0].displayName : formValue.country);

    formData.append("languagesFrameworksForSelect", JSON.stringify({
      "languages": formValue.programmingLang,
      "frameworks": formValue.languagesFrameworks
    }));

    formData.append("employment", formValue.employment[0].value ? formValue.employment[0].value : formValue.employment);


    return formData;
  }

  // private formValueOrDisplayName(value: string | object): string | object {
  //
  //   return value["displayName"] ? value["displayName"] : value;
  // }
}
