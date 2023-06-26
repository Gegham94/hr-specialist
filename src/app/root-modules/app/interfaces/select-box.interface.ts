export type StringOrNumber = string | number;

export interface ISelectBox {
  id?: StringOrNumber;
  value?: string;
  count?: number;
}

export interface ISelectBoxOptions {
  isReversed: boolean;
  isOpen : boolean;
  optionsLabel: string;
  label: string;
}