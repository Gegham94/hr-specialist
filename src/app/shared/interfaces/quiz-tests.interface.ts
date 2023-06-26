
export interface IQuizTestResponseSettings {
  remainingTime: string;
  remainingFixedTime: string;
  displayTestName: string;
}

export interface IQuizTestResponseDto {
  uuid: string;
  questions: IQuizTestResponse[];
  typeOfQuiz: string;
}

export interface IQuizTestResponse {
  uuid: string;
  testUuid: string;
  question: string;
  answers: IQuizTestAnswers[];
}

export interface IQuizTestAnswers {
  id: string;
  answer: string;
  is_correct: boolean;
  is_selected: boolean;
}