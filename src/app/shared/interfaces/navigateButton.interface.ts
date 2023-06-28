import {Helper} from "./employee.interface";

export interface INavigateButton {
  id: number;
  text: string;
  statusType: "default" | "disabled";
  icon: string;
  link: string;
  activateLink: string;
}

export class NavigationButton implements INavigateButton {
  id!: number;
  text!: string;
  statusType!: "default" | "disabled";
  icon!: string;
  link!: string;
  activateLink!: string;

  constructor(navButton: INavigateButton, helper: Helper) {
    Object.assign(this, navButton);
    helper.hidden ? this.statusType = "default" : "disabled";
  }
}
