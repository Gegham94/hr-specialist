import { animate, group, style, transition, trigger, useAnimation } from "@angular/animations";
import { moveFromLeft, moveFromRight } from "ngx-router-animations";

export const moveFromRightAnimation = trigger("moveFromRightFade", [
  transition("info => *", useAnimation(moveFromRight)),
  transition("education => experience", useAnimation(moveFromRight)),
  transition("education => skills", useAnimation(moveFromRight)),
  transition("experience => skills", useAnimation(moveFromRight)),
]);

export const moveFromLeftAnimation = trigger("moveFromLeftFade", [
  transition("skills => *", useAnimation(moveFromLeft)),
  transition("experience => education", useAnimation(moveFromLeft)),
  transition("experience => info", useAnimation(moveFromLeft)),
  transition("education => info", useAnimation(moveFromLeft)),
]);

export const moveBackWithNoAnimation = trigger("moveNoAnimation", [transition("* => info", animate("0s ease-out"))]);

export const slideInOutAnimation = trigger("slideInOut", [
  transition(":leave", [
    style({ height: "*", opacity: 1 }),
    group([animate(250, style({ height: 0 })), animate("100ms ease-in-out", style({ opacity: "0" }))]),
  ]),
  transition(":enter", [
    style({ height: "0", opacity: 0 }),
    group([animate(250, style({ height: "*" })), animate("150ms ease-in-out", style({ opacity: "1" }))]),
  ]),
]);
