import { TemplateRef } from "@angular/core";

export interface IModal {
  isOpen: boolean;
  width?: string;
  height?: string;
  modalContentTpl?: TemplateRef<any>;
  image: Event;
}
