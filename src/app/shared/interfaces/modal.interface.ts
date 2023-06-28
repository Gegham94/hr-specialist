import { TemplateRef } from "@angular/core";

export interface IModalOld {
  isOpen: boolean;
  width?: string;
  height?: string;
  modalContentTpl?: TemplateRef<any>;
  image: Event;
}
