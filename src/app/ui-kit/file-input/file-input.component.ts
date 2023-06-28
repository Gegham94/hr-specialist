import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ChangeDetectorRef,
  OnInit,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { BehaviorSubject, filter, takeUntil } from "rxjs";

import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { ButtonTypeEnum } from "../../shared/constants/button-type.enum";
import { ScreenSizeService } from "../../shared/services/screen-size.service";
import { ToastsService } from "../../shared/services/toasts.service";
import { EDIT_ICON, PROFILE_PLACEHOLDER } from "../../shared/constants/images.constant";
import { ModalService } from "src/app/shared/services/modal.service";
import { InputStatusEnum } from "src/app/shared/constants/input-status.enum";

export interface ImageProps {
  width: string;
  height: string;
}

@Component({
  selector: "hr-file-input",
  templateUrl: "./file-input.component.html",
  styleUrls: ["./file-input.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FileInputComponent,
    },
  ],
})
export class FileInputComponent extends Unsubscribe implements ControlValueAccessor, OnDestroy, OnInit {
  @Input() set logo(value: string | File | null) {
    if (!!value) {
      if (typeof value === "string") {
        this.croppedImage = value;
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.croppedImage = reader.result as string;
          this.isLoading$.next(true);
        };
        reader.readAsDataURL(value);
      }
    }
  }

  public EDIT_ICON = EDIT_ICON;
  public PROFILE_PLACEHOLDER = PROFILE_PLACEHOLDER;
  public buttonTypesList = ButtonTypeEnum;
  public imageChangedEventBackup!: Event;
  public imageChangedEvent!: Event;
  public croppedImage: string = "";
  public croppedTemporaryImage: string = "";
  public logoName: string = "";
  public originalFile!: File;
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public imageProps: ImageProps = {
    width: "",
    height: "",
  };
  public isCropperLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private fileValidated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private _isModalOpen: boolean = false;
  @Input("feedback-text") feedbackTextProps: string = "";
  @Input("error-status") errorStatus: InputStatusEnum = InputStatusEnum.default;

  public get isModalOpen(): boolean {
    return this._isModalOpen;
  }

  public set isModalOpen(value: boolean) {
    if (value) {
    } else {
      this._modalService.modalContent.next(null);
    }
    this._isModalOpen = value;
  }

  @Output() imageInput: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild("fileInput") fileInput!: ElementRef;

  constructor(
    private readonly screenSizeService: ScreenSizeService,
    private readonly _toastService: ToastsService,
    private readonly _modalService: ModalService,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnInit(): void {
    this.fileValidated$.pipe(filter(Boolean), takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (res) {
        this._modalService.modalContent.next({
          isOpen: true,
          width: this.imageProps.width,
          height: this.imageProps.height,
          image: this.imageChangedEventBackup,
        });
        this.imageChangedEvent = this.imageChangedEventBackup;
        this.modalToggle(true);
        this.isCropperLoading$.next(true);
      }
    });
    this._modalService.resetFileInput.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.modalToggle(false);
      this.fileInput.nativeElement.value = "";
    });

    this._modalService.submitCroppedFile.pipe(takeUntil(this.ngUnsubscribe)).subscribe((file: File | null) => {
      if (file) {
        this.onChange(file);
        this.onTouch(file);
        this.modalToggle(false);
        this.imageInput.emit(this.croppedImage ? this.croppedImage : "");
        const reader = new FileReader();
        reader.onloadend = () => {
          this.croppedImage = reader.result as string;
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  public ngOnChanges(): void {
    this.screenSizeService.screenSize$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.cdr.detectChanges());
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  public isLoading() {
    this.isLoading$.next(false);
  }

  public fileChangeEvent(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.originalFile = (target.files as FileList)[0];
    this.imageChangedEventBackup = event;
    this.checkForValidImage(this.originalFile);

    if (target) {
      this.logoName = Date.now().toString() + this.originalFile.name;
    }
  }

  private checkForValidImage(file: File): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const image = new Image();
      image.src = reader.result as string;

      image.onload = () => {
        if (image.width < 180 && image.height < 180) {
          this._toastService.addToast({
            title: "Пожалуйста, выберите фотографию шириной не менее 180 пикселей!",
          });
          (this.fileInput.nativeElement as HTMLInputElement).value = "";
          this.fileValidated$.next(false);
        } else if (image.width > 2560 && image.height > 1440) {
          this._toastService.addToast({
            title: "Пожалуйста, выберите фотографию разрешением не более 2К(2560x1440px)!",
          });
          (this.fileInput.nativeElement as HTMLInputElement).value = "";
          this.fileValidated$.next(false);
        } else {
          this.fileValidated$.next(true);
        }
      };
    };
  }

  public modalToggle(val?: boolean): void {
    this.isModalOpen = val !== undefined ? val : !this.isModalOpen;
  }

  public onChange: (val: File) => void = () => {};

  public onTouch: (val: File) => void = () => {};

  public registerOnChange(fn: (val: File) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: (val: File) => void): void {
    this.onTouch = fn;
  }

  public writeValue(value: string): void {}
}
