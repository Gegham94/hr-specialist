import {Component} from "@angular/core";

@Component({
  selector: "hr-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"]
})
export class FooterComponent {

  public redirectTo(url: string) {
    window.open("http://80.249.146.197:3110" + url, "_blank");
  }
}
