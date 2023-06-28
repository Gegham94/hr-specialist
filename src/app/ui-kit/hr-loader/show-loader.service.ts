import { Injectable } from "@angular/core";
import { NavigationEnd, NavigationStart, Router, Scroll } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { resumeRoutesArray, ResumeRoutesEnum } from "src/app/modules/profile/constants/resume-routes.constant";
import { LocalStorageService } from "../../shared/services/local-storage.service";

@Injectable({
  providedIn: "root",
})
export class ShowLoaderService {
  private isLoading$ = new BehaviorSubject(false);
  public isNavButtonCreated$ = new BehaviorSubject(false);
  private time: number = 800;

  constructor(private router: Router, private localStorageService: LocalStorageService) {
    this.navigationInterceptor();
  }

  public navigationInterceptor(): void {
    this.router.events.subscribe((navigation) => {
      if (navigation instanceof NavigationStart) {
        if (!resumeRoutesArray.includes(navigation.url)) {
          this.isLoading$.next(true);
          this.localStorageService.setItem("resumeMode", JSON.stringify("CREATE"));
          this.localStorageService.setItem("firstInit", JSON.stringify(true));
        }
      }
      if (!(navigation instanceof NavigationEnd) && !(navigation instanceof NavigationStart)
        && !this.isNavButtonCreated$.value) {
        this.isLoading$.next(false);
      }

      if (navigation instanceof Scroll && !this.isNavButtonCreated$.value) {
        if (
          navigation.routerEvent.id === 1 &&
          navigation.routerEvent.url === navigation.routerEvent.urlAfterRedirects
        ) {
          this.isLoading$.next(true);
        } else {
          // if (navigation.routerEvent.urlAfterRedirects === ResumeRoutesEnum.INFO) {
          //   this.isLoading$.next(true);
          // }
        }
        setTimeout(() => {
          this.isLoading$.next(false);
        }, this.time);
      }
    });
  }


  public getIsLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  public setIsLoading(value: boolean): void {
    this.isLoading$.next(value);
  }
}
