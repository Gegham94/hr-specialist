import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { QuizComponent } from "./quiz.component";
import { QuizRoutingModule } from "./quiz-routing.module";
import { UiModule } from "src/app/ui-kit/ui.module";
import { QuizResultComponent } from './quiz-result/quiz-result.component';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [QuizComponent, QuizResultComponent],
  imports: [
    FormsModule,
    CommonModule,
    QuizRoutingModule,
    UiModule
  ],
  exports: [QuizComponent],
  providers: [DatePipe]
})
export class QuizModule {}
