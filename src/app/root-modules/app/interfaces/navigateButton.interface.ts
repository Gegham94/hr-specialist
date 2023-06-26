import {Helper} from "./employee.interface";

export interface NavigateButtonInterface {
  id: number;
  text: string;
  statusType: "default" | "disabled";
  icon: string;
  link: string;
  activateLink: string;
}

export class NavigationButton implements NavigateButtonInterface {
  id!: number;
  text!: string;
  statusType!: "default" | "disabled";
  icon!: string;
  link!: string;
  activateLink!: string;

  constructor(navButton: NavigateButtonInterface, helper: Helper) {
    Object.assign(this, navButton);
    helper.hidden ? this.statusType = "default" : "disabled";
  }
}
