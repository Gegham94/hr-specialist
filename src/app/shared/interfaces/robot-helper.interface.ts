export interface RobotHelperInterface {
  content: string | string[];
  navigationItemId: number | null;
  isContentActive: boolean;
  uuid?: string;
  showSecondRobot?: RobotHelperInterface;
  activeContentLink?: string;
}

export type RobotHelper = RobotHelperInterface | null;
