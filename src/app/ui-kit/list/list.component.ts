import { Component, Input, OnInit } from "@angular/core";
import { ButtonTypeEnum } from "../../shared/constants/button-type.enum";
import { ListTypesEnum } from "src/app/shared/constants/list-types.enum";

@Component({
  selector: "hr-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ListComponent implements OnInit {
  public buttonTypesList = ButtonTypeEnum;
  public listTypesList = ListTypesEnum;
  @Input("type") typeProps?: ListTypesEnum = ListTypesEnum.default;
  @Input("person-name") personName: string = "";
  @Input("person-email") personEmail: string = "";
  @Input("person-position") personPosition: string = "";
  @Input("person-work-date") personWorkDate: string = "";

  ngOnInit(): void {}
}
