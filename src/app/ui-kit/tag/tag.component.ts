import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { TagTypesEnum } from "src/app/shared/constants/tag-types.enum";

@Component({
  selector: "hr-tag",
  templateUrl: "./tag.component.html",
  styleUrls: ["./tag.component.scss"],
})
export class TagComponent {
  @Input("text") public textProps!: string;
  @Input("type") public typeProps: TagTypesEnum = TagTypesEnum.default;
  @Input("delete") public isDelete=true;
  @Output() delete: EventEmitter<string> = new EventEmitter();

  public deleteTag() {
    this.delete.emit();
  }
}
