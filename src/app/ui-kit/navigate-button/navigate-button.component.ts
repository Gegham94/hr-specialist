import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { NavigateButtonTypesEnum } from "../../root-modules/app/constants/navigate-button-types.enum";
import {RobotHelperService} from "../../root-modules/app/services/robot-helper.service";
import {Observable} from "rxjs";
import {RobotHelper} from "../../root-modules/app/interfaces/robot-helper.interface";

@Component({
  selector: "hr-navigate-button",
  templateUrl: "./navigate-button.component.html",
  styleUrls: ["./navigate-button.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigateButtonComponent {
  @Input("type") public typeProps: NavigateButtonTypesEnum | string = NavigateButtonTypesEnum.disabled;
  @Input("notification-count") public notificationCountProps?: number;
  @Input("text") public textProps!: string;
  @Input("link") public linkProps?: string;
  @Input("icon") public iconProps?: string;
  @Input("isActive") public isActive: string = "notActive";

  public navigateButtonTypesList = NavigateButtonTypesEnum;
  public isRobotOpen$: Observable<boolean> = this._robotHelperService.isRobotOpen;
  public robotSettings$: Observable<RobotHelper> = this._robotHelperService.getRobotSettings();

  constructor(private readonly _robotHelperService: RobotHelperService) {}
}
