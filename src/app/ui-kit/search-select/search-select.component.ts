import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnChanges,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import { SelectAllData } from "../../shared/constants/const-varibale";
import { ScreenSizeService } from "../../shared/services/screen-size.service";
import { ScreenSizeEnum } from "../../shared/constants/screen-size.enum";
import { ISearchableSelectData } from "src/app/shared/interfaces/searchable-select-data.interface";
import { ScreenSizeType } from "src/app/shared/interfaces/screen-size.type";

@Component({
  selector: "hr-search-select",
  templateUrl: "./search-select.component.html",
  styleUrls: ["./search-select.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SearchSelectComponent,
    },
  ],
})
export class SearchSelectComponent implements ControlValueAccessor, OnChanges, OnDestroy {
  private _isDropdownOpen: boolean = false;
  public filterQuery: string = "";
  public selectedOptionsForDisplay: string = "";
  public dropdownOptions: ISearchableSelectData[] | null = [];
  public selectedOptions: ISearchableSelectData[] = [];
  private isTouched: boolean = false;
  private optionsBackup!: ISearchableSelectData[] | null;
  private placeholderCopy!: string;
  public isSelectOptionsVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private unlistenDocumentClick!: () => void;

  public get isDropdownOpen(): boolean {
    return this._isDropdownOpen;
  }

  public set isDropdownOpen(value: boolean) {
    this._isDropdownOpen = value;
    this.cdr.detectChanges();
  }

  @ViewChild("input") input!: ElementRef<HTMLInputElement>;
  @ViewChild("dropdownList") dropdownList!: ElementRef<HTMLDivElement>;
  @ViewChild("select") select!: ElementRef<HTMLDivElement>;

  @Input("valid") valid?: boolean = undefined;

  /**Название селекта */
  @Input() label!: string;

  @Input() isBorderGreen: boolean = true;

  @Input() hasDefaultValue: boolean = false;

  @Input() defaultValue!: string;

  /**Текст placeholder-a в input-е */
  @Input() placeholder: string = "";

  /**Если isInputReadOnly = true, то поиск отключен и в строку input-а нельзя написать*/
  @Input() isInputReadOnly: boolean = false;

  /**Если isMultiSelect = true, вместо обычного дропдаун-селекта, будет возможность мулти-селекта чекбоксами*/
  @Input() isMultiSelect: boolean = false;

  /**Boolean-ом передать признак о загрузке */
  @Input() isLoading: boolean = false;

  /**Boolean-ом передать значение о невозможностьи удаления позиции спецалиста при фильтре тестов */
  @Input() isCross: boolean = true;

  /**Boolean-ом передать признак об активности режима редактирования */
  @Input() isEditModeActive: boolean = false;

  /**Boolean-ом передать признак disabled */
  @Input() isInputDisabled: boolean = false;

  /**Boolean-ом передать признак Inn */
  @Input() isInn: boolean = false;

  /**Если в writeValue передаем данные с формы в типе string, нужно передать true для корректной работы компонента */
  @Input() dataInputAsString: boolean = false;

  @Input() updateEveryTime: boolean = false;

  @Input() isRequired: boolean = true;

  /**Опции дропдаун меню*/
  @Input() set options(value: ISearchableSelectData[] | null) {
    this.dropdownOptions = value;
    this.optionsBackup = value;
    this.isSelectOptionsVisible.next(true);
    if (value && value.length === 1 && value[0].displayName === SelectAllData) {
      this.isSelectOptionsVisible.next(false);
    }
    this.selectOptionFromStringValue();
  }

  @Output() selectedOptionOutput: EventEmitter<ISearchableSelectData> = new EventEmitter<ISearchableSelectData>();

  @Output() selectedOptionsOutput: EventEmitter<ISearchableSelectData[]> = new EventEmitter<ISearchableSelectData[]>();

  @Output() filterQueryChange: EventEmitter<string> = new EventEmitter<string>();

  public readonly ScreenSizeEnum = ScreenSizeEnum;

  constructor(
    private renderer2: Renderer2,
    private cdr: ChangeDetectorRef,
    private screenSizeService: ScreenSizeService
  ) {}

  get screenSize(): ScreenSizeType {
    return this.screenSizeService.calcScreenSize;
  }

  public get selectWidth(): number {
    return this.select?.nativeElement.clientWidth + 1;
  }

  public get dropdownHeight(): number {
    if (this.isLoading) {
      return 184;
    }
    if (!this.isSelectOptionsVisible.value) {
      return 130;
    } else if (this.isDropdownOpen && this.dropdownOptions) {
      const viewportHeight = this.dropdownOptions.length * 46 + 2;
      return viewportHeight < 184 ? viewportHeight : 184;
    } else if (this.isDropdownOpen && !this.dropdownOptions) {
      return 130;
    }
    return 0;
  }

  public ngOnInit(): void {
    this.placeholderCopy = this.placeholder;
    this.setDefaultValue();
    this.listenForClickOutside();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (!Boolean(this.defaultValue) && this.hasDefaultValue) {
      this.onChange([]);
      this.selectedOptionsForDisplay = "";
      this.filterQuery = "";
    }

    this.selectOptionFromStringValue();
  }

  public ngOnDestroy(): void {
    this.unlistenDocumentClick();
  }

  private setDefaultValue() {
    if (this.defaultValue === SelectAllData) {
      this.selectedOptions = this.dropdownOptions?.filter((option) => option.displayName === this.defaultValue) || [];
      this.toggleCheckedState(this.selectedOptions[0]);
    } else {
      this.placeholder = this.placeholderCopy;
    }
  }

  public showTooltip(label: HTMLSpanElement | HTMLParagraphElement): boolean {
    return label.clientWidth < label.scrollWidth;
  }

  // input filter functions
  public filterOptions(): void {
    if (this.isInn) {
      this.filterQueryChange.emit(this.filterQuery);
    }
    const filteredOptions = this.optionsBackup?.filter((option) =>
      option.displayName.toLowerCase().includes(this.filterQuery.toLowerCase())
    );
    this.dropdownOptions = filteredOptions ? filteredOptions : null;
  }

  // checked state functions
  public isOptionChecked(option: ISearchableSelectData): boolean {
    return this.selectedOptions ? !!this.selectedOptions.find((selected) => selected.id === option.id) : false;
  }

  public toggleCheckedState(option: ISearchableSelectData) {
    this.isTouched = true;
    this.onTouch();
    if (this.isMultiSelect) {
      if (!this.isOptionChecked(option)) {
        this.selectedOptions.push(option);
        this.filterQuery = "";
        this.options = this.optionsBackup;
      } else {
        const selectedOptionIds = this.selectedOptions.map((selectedOptions) => selectedOptions.id);
        const index = selectedOptionIds.indexOf(option.id);
        this.selectedOptions.splice(index, 1);
      }
      if (this.updateEveryTime) {
        this.onChange(this.selectedOptions);
      }
      this.selectedOptionsOutput.emit(this.selectedOptions);
    } else {
      this.selectedOptions = [];
      this.selectedOptions.push(option);
      this.selectedOptionOutput.emit(option);
      const [selectedOption] = this.selectedOptions;
      selectedOption.value !== SelectAllData && !this.hasDefaultValue && this.defaultValue
        ? (this.placeholder = "")
        : (this.placeholder = this.placeholderCopy);

      this.closeDropdownAndCommitChanges();
    }

    this.selectedOptionsForDisplay = this.convertSelectedOptionsToStringArray(this.selectedOptions);
  }

  // dropdown state functions
  private openDropwdown(): void {
    this.isDropdownOpen = true;
  }

  private closeDropdownAndCommitChanges(): void {
    this.isDropdownOpen = false;
    this.dropdownOptions = this.optionsBackup;
    this.filterQuery = "";
    if (this.isTouched) {
      this.onChange(this.selectedOptions);
      this.isTouched = false;
    }
  }

  // input clear
  public handleInputClear(): void {
    if (!this.isInputDisabled) {
      this.selectedOptions = [];
      this.filterQuery = "";
      this.options = this.optionsBackup;
      this.defaultValue ? this.setDefaultValue() : this.onChange([]);
      this.filterQueryChange.emit("");
      this.selectedOptionsForDisplay = "";
      // @ts-ignore
      this.selectedOptionOutput.emit("");
      this.selectedOptionsOutput.emit([]);
    }
  }

  // NgValueAccessor functions
  onChange: any = (value: ISearchableSelectData[]) => {};

  onTouch: any = () => {};

  writeValue(selectedValues: ISearchableSelectData[] | string | null): void {
    if (this.isMultiSelect) {
      if (selectedValues && selectedValues.length) {
        this.selectedOptionsForDisplay = this.convertSelectedOptionsToStringArray(selectedValues);
      } else {
        this.selectedOptionsForDisplay = "";
      }
    } else {
      this.selectedOptionsForDisplay = selectedValues ? this.convertSelectedOptionsToStringArray(selectedValues) : "";
    }
    if (typeof selectedValues !== "string") {
      this.selectedOptions = selectedValues ? selectedValues : [];
      this.selectedOptionsForDisplay = selectedValues ? this.convertSelectedOptionsToStringArray(selectedValues) : "";
    } else {
      this.selectOptionFromStringValue();
      this.selectedOptionsForDisplay = selectedValues;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  // helper/utility functions
  private selectOptionFromStringValue(): void {
    if (this.dataInputAsString) {
      this.selectedOptions =
        this.dropdownOptions?.filter((option) => option.displayName === this.selectedOptionsForDisplay) || [];
      this.onChange(this.selectedOptions);
    }
  }

  private convertSelectedOptionsToStringArray(selectedOptions: ISearchableSelectData[] | string): string {
    if (this.isInn) {
      return this.selectedOptions.map((option) => option.value).join(", ");
    }

    if (typeof selectedOptions === "string") {
      return selectedOptions;
    }
    return selectedOptions.map((option) => option.displayName).join(", ");
  }

  private listenForClickOutside(): void {
    this.unlistenDocumentClick = this.renderer2.listen("document", "click", (e) => {
      if (this.dropdownList.nativeElement.contains(e.target as Node) && !this.isMultiSelect) {
        this.closeDropdownAndCommitChanges();
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      if (
        (this.dropdownList.nativeElement.contains(e.target as Node) ||
          this.input.nativeElement.contains(e.target as Node)) &&
        !this.isInputDisabled
      ) {
        this.openDropwdown();
      } else {
        if (this.isDropdownOpen) {
          this.closeDropdownAndCommitChanges();
        }
        return;
      }
    });
  }
}

// TODO:
// arrow controls
// you can try preventing default blur behaviour of input on mobile. to avoid keyboard open/close loops
