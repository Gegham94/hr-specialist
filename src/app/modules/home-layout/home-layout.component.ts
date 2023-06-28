import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { NavigateButtonFacade } from "../../ui-kit/navigate-button/navigate-button.facade";
import { HomeLayoutState } from "./home-layout.state";
import { BehaviorSubject, combineLatest, map, Observable, of, switchMap, takeUntil, tap } from "rxjs";
import { NavigateButton } from "./home-layout.interface";
import { ChatFacade } from "../chat/services/chat.facade";
import { Unsubscribe } from "../../shared/unsubscriber/unsubscribe";
import { base64ToFile, Dimensions, ImageCroppedEvent, ImageTransform, LoadedImage } from "ngx-image-cropper";
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { IMessage, Message } from "../chat/interface/messages.interface";
import { Conversation, IConversation } from "../chat/interface/conversations.interface";
import { ShowLoaderService } from "../../ui-kit/hr-loader/show-loader.service";
import { NavigateButtonState } from "../../ui-kit/navigate-button/navigate-button.state";
import { SocketService } from "../chat/services/socket.service";
import { WindowNotificationService } from "../service/window-notification.service";
import { ResumeStateService } from "../profile/services/resume-state.service";
import { ResumeRoutesEnum } from "../profile/constants/resume-routes.constant";
import { AuthService } from "../auth/service/auth.service";
import { EmployeeInfoFacade } from "../profile/services/employee-info.facade";
import { ProfileFormControlService } from "../profile/components/profile-edit/service/profile-form-control.service";
import { HeaderTypeEnum } from "src/app/shared/constants/header-type.enum";
import { INavigateButton, NavigationButton } from "src/app/shared/interfaces/navigateButton.interface";
import { RobotHelper } from "src/app/shared/interfaces/robot-helper.interface";
import { Helper, IEmployee } from "src/app/shared/interfaces/employee.interface";
import { LocalStorageService } from "src/app/shared/services/local-storage.service";
import { RobotHelperService } from "src/app/shared/services/robot-helper.service";
import { ToastsService } from "src/app/shared/services/toasts.service";
import { ScreenSizeService } from "src/app/shared/services/screen-size.service";
import { ModalService } from "src/app/shared/services/modal.service";
import { IModalOld } from "src/app/shared/interfaces/modal.interface";

@Component({
  selector: "hr-home-layout",
  templateUrl: "./home-layout.component.html",
  styleUrls: ["./home-layout.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeLayoutComponent extends Unsubscribe implements OnInit, OnDestroy {
  public headerTypeProps: HeaderTypeEnum = HeaderTypeEnum.company;
  public navigateButtons$ = this._navigateButtonFacade.getShowedNavigationsMenu$();
  public navigateButtons!: INavigateButton[];
  public isRobotOpen$: Observable<boolean> = this._robotHelperService.isRobotOpen;
  public robotSettings$: Observable<RobotHelper> = this._robotHelperService.getRobotSettings();
  public robotMapInfo: string = "";
  public buttonsStatuses = this._homeLayoutState.getButtonsStatuses();
  public employee$!: IEmployee;
  public containWithinAspectRatio: boolean = false;
  public canvasRotation: number = 0;
  public transform: ImageTransform = {};
  public scale: number = 1;
  public croppedImage: string = "";
  public croppedTemporaryImage: string = "";
  public isCropperLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @ViewChildren("slickItem") slickItem!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChild("cropperActionsWrapper")
  cropperActionsWrapper!: ElementRef<HTMLDivElement>;
  public conversations$: Observable<IConversation[] | null> = this._chatFacade.getConversations$();

  public slideConfig = {
    slidesToShow: 6,
    slidesToScroll: 6,
    infinite: false,
    responsive: [
      {
        breakpoint: 1500,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          arrows: true,
          prevArrow: "<img class='a-left control-c prev slick-prev' src='./assets/img/icon/prev.svg' alt='prev'>",
          nextArrow: "<img class='a-right control-c next slick-next' src='./assets/img/icon/next.svg' alt='next'>",
          infinite: false,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          prevArrow: "<img class='a-left control-c prev slick-prev' src='./assets/img/icon/prev.svg' alt='prev'>",
          nextArrow: "<img class='a-right control-c next slick-next' src='./assets/img/icon/next.svg' alt='next'>",
          infinite: false,
        },
      },
    ],
  };

  public slideActiveId: number = 0;
  public itemWidth: number = 250;

  public afterChange(e: { slick: { activeBreakpoint: number }; currentSlide: number }): void {
    if (e.slick.activeBreakpoint === 1500) {
      e.currentSlide > 2 ? (this.slideActiveId = 1) : (this.slideActiveId = 0);
    } else {
      this.slideActiveId = e.currentSlide;
    }
  }

  public get modal$(): Observable<IModalOld | null> {
    return this._modalService.modalContent;
  }

  get heightExceptActions(): string | SafeStyle {
    if (this.cropperActionsWrapper) {
      const height = this.sanitizer.bypassSecurityTrustStyle(
        `calc(100% - ${this.cropperActionsWrapper.nativeElement.clientHeight}px)`
      );
      return height;
    }
    return "0";
  }

  get isScaleDownDisabled(): boolean {
    return this.scale === 0.1;
  }

  get mobileCompilerPage(): boolean {
    return this._screenSizeService.calcScreenSize !== "DESKTOP" && this._router.url.includes("compiler-test");
  }

  constructor(
    private readonly _authService: AuthService,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
    private readonly _navigateButtonState: NavigateButtonState,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _employeeFacade: EmployeeInfoFacade,
    private readonly _chatFacade: ChatFacade,
    private readonly _localStorage: LocalStorageService,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _cdr: ChangeDetectorRef,
    private readonly sanitizer: DomSanitizer,
    private readonly _toastService: ToastsService,
    private readonly _router: Router,
    private readonly _resumeState: ResumeStateService,
    private readonly _profileFormControlService: ProfileFormControlService,
    private readonly _showLoaderService: ShowLoaderService,
    private readonly _socketService: SocketService,
    private readonly _windowNotificationService: WindowNotificationService,
    private readonly _screenSizeService: ScreenSizeService,
    public readonly _modalService: ModalService
  ) {
    super();
    this._windowNotificationService.askPermission();
  }

  ngOnInit() {
    this._router.events
      .pipe(
        switchMap((event) => {
          const allowedRoutes = [
            ResumeRoutesEnum.INFO,
            ResumeRoutesEnum.EXPERIENCE,
            ResumeRoutesEnum.EDUCATION,
            ResumeRoutesEnum.SKILLS,
          ];
          if (event instanceof NavigationEnd) {
            if (allowedRoutes.indexOf(event.url as ResumeRoutesEnum) > -1) {
              return of(null);
            }
            return this._resumeState.editModeActive$.pipe(
              switchMap((editMode) => {
                if (!editMode) {
                  return of(null);
                }
                return this._resumeState.constructedData$.pipe(
                  switchMap((data) => {
                    if (!data) {
                      return of(null);
                    }
                    const { userInfo, userEducation, userExperience, userSkills } = data;
                    return this._resumeState.updateAllFormGroups(userInfo, userEducation, userExperience, userSkills);
                  })
                );
              })
            );
          }
          return of(null);
        })
      )
      .subscribe();

    if (this.isLogged) {
      this._socketService.setSocket(this._authService.getToken || "");

      this._employeeFacade
        .getResume()
        .pipe(
          takeUntil(this.ngUnsubscribe),
          switchMap((resume) => {
            // this switchMap is used for initializing resume forms in indexedDB
            return this._chatFacade.emitGetConversationsRequest(resume).pipe(map(() => resume));
          }),
          switchMap((resume) => {
            // this switchMap is used for initializing resume forms in indexedDB
            return this._resumeState.createResumeFormSections(resume).pipe(map((res) => resume));
          }),
          switchMap((resume) => {
            // this switchMap is used for setting form data from indexedDB to local formGroups
            return combineLatest([
              this._profileFormControlService.initInfoForm(),
              this._profileFormControlService.initEducationForm(),
              this._profileFormControlService.initExperienceForm(),
              this._profileFormControlService.initSkillsForm(),
            ]).pipe(map((res) => resume));
          })
        )
        .subscribe((resume) => {
          // this._resumeState.createResumeFormSections(resume);
          this._showLoaderService.isNavButtonCreated$.next(false);
          if (resume && resume.robot_helper) {
            this.generateNavigationButtons(resume.robot_helper);
          }
          if (
            [
              ResumeRoutesEnum.RESUME,
              ResumeRoutesEnum.INFO,
              ResumeRoutesEnum.EXPERIENCE,
              ResumeRoutesEnum.EDUCATION,
              ResumeRoutesEnum.SKILLS,
            ].indexOf(this._router.url as ResumeRoutesEnum) > -1
          ) {
            if (resume && !!resume.name && JSON.parse(this._localStorage.getItem("resumeMode") ?? "") !== "EDIT") {
              // this._localStorage.setItem("resumeMode", JSON.stringify("EDIT"));
              this._router.navigateByUrl("/employee/resume");
            } else {
              // this._localStorage.setItem("resumeMode", JSON.stringify("CREATE"));
              this._router.navigateByUrl("/employee/resume/edit/info");
            }
          }
          this._cdr.detectChanges();
        });

      this._chatFacade
        .getMessageFromCompanyToEmployeeHandler$()
        .pipe(
          takeUntil(this.ngUnsubscribe),
          tap((message: IMessage) => {
            this.setMessage(message);
          })
        )
        .subscribe();

      this._homeLayoutState
        .isNavigationButtonsUpdate()
        .pipe(
          takeUntil(this.ngUnsubscribe),
          switchMap((data) => {
            return this._localStorage.resume$;
          })
        )
        .subscribe((resume) => {
          if (resume) {
            this.employee$ = resume;
            this.employee$?.robot_helper?.forEach((page) => {
              const button = this.buttonsStatuses.find((btn: NavigateButton) => btn["link"] === page["link"]);
              if (button) {
                button.status = page["hidden"];
              }
            });
            this._cdr.detectChanges();
          }
        });
    }
  }

  public setMessage(message: IMessage): void {
    const conversations = this._chatFacade.getConversations();
    const conversation = conversations?.find(
      (item) => item.last_message?.conversationUuid === message.conversationUuid
    );
    if (conversation) {
      conversation
        .setUpdateLastMessage(
          message.senderUuid ?? "",
          message.message,
          message.uuid as string,
          message.createdAt,
          false
        )
        .setUpdateStatus(true);

      const rearrangedConversations = this._chatFacade.rearrangeConversation(conversations);
      if (rearrangedConversations) {
        this._chatFacade.setConversations(rearrangedConversations);
      }

      const newMessage = new Message(message).setPosition(false);

      const selectedConversation = this._chatFacade.getSelectedConversation();
      if (conversation.last_message.conversationUuid === selectedConversation?.last_message.conversationUuid) {
        this._chatFacade.addChatMessage(newMessage);
      }
    } else {
      this.getConversations(this.employee$)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((res) => {
          this.setMessage(message);
        });
    }
    this._cdr.markForCheck();
  }

  public get notificationCount() {
    const conversations = this._chatFacade.getConversations();
    const unreadConversations = conversations.filter((item) => item.hasUpdate);
    this._windowNotificationService.createNotification("", unreadConversations.length);
    return unreadConversations.length;
  }

  private generateNavigationButtons(helpers: Helper[]): void {
    let navButtonsForDisplay: NavigationButton[] = [];
    helpers.forEach((helper) => {
      if (helper.link.includes("/isActive")) {
        const navButton = this._navigateButtonState.navigationButtons.find(
          (button) => button.activateLink + "/isActive" === helper.link
        );
        if (navButton) {
          navButtonsForDisplay.push(new NavigationButton(navButton, helper));
        }
      }
    });
    navButtonsForDisplay = navButtonsForDisplay.sort((a, b) => a.id - b.id);
    this._navigateButtonFacade.setShowedNavigationsMenu$(navButtonsForDisplay);
  }

  public getConversations(employee: IEmployee): Observable<Conversation[]> {
    return this._chatFacade.emitGetConversationsRequest(employee).pipe(
      takeUntil(this.ngUnsubscribe),
      tap((conversations) => {
        if (conversations?.length) {
          const unreadConversations = conversations.filter(
            (item: { last_message: { messageStatus: boolean } }) => !item?.last_message?.messageStatus
          );
          if (unreadConversations.length) {
            this._chatFacade.setUnreadMessagesCount$(unreadConversations.length);
          } else {
            this._chatFacade.setUnreadMessagesCount$(0);
          }
        }
      })
    );
  }

  public get isLogged(): boolean {
    return !!this._authService.getToken && this._authService.isTokenExpired;
  }

  public openRobot(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    const width = (this.slickItem.first.nativeElement as HTMLDivElement).style.width;
    this.itemWidth = +width.slice(0, width.length - 2);
    this._robotHelperService.isRobotOpen$.next(true);
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  public originalFile!: File;
  public test!: File;

  public imageCropped(event: ImageCroppedEvent): void {
    this.croppedTemporaryImage = event.base64 ?? "";
    if (event.base64) {
      const file = new File([base64ToFile(event.base64)], Date.now().toString() + this.originalFile?.name, {
        lastModified: this.originalFile?.lastModified,
        type: this.originalFile?.type,
      });
      if (file) {
        this.test = file;
      }
    }
  }

  submitCroppedImage(): void {
    document.body.style.overflowY = "auto";
    this._modalService.submitCroppedFile.next(this.test);
  }

  public cropperReady(dimensions: Dimensions): void {
    console.log("ready");

    this.isCropperLoading$.next(false);
  }

  public imageLoaded(image: LoadedImage): void {
    this.isCropperLoading$.next(false);
  }

  public loadImageFailed() {
    // this.isModalOpen = false;
    console.log("failed");

    this._toastService.addToast({
      title: "Не удалось загрузить ваши фотографии!",
    });
  }

  public rotateLeft(): void {
    this.canvasRotation--;
    this.flipAfterRotate();
  }

  public rotateRight(): void {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH,
    };
  }

  public flipHorizontal(): void {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH,
    };
  }

  public flipVertical(): void {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV,
    };
  }

  public resetImage(): void {
    this.croppedImage = "";
    this.croppedTemporaryImage = "";
    this.canvasRotation = 0;
    this.scale = 1;
    this.containWithinAspectRatio = false;
    this.transform = {};
  }

  public closeModal(): void {
    this.resetImage();
    document.body.style.overflowY = "auto";
    this._modalService.resetFileInput.next();
  }

  public zoomOut(): void {
    this.scale = Number((this.scale - 0.1).toFixed(1));
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  public zoomIn(): void {
    this.scale += 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  public toggleContainWithinAspectRatio(): void {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }
}
