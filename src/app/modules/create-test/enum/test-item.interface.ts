import { IQuizTestResponse } from "src/app/shared/interfaces/quiz-tests.interface";

export interface TestInterface {
  count: number;
  data: TestItemInterface[];
}

export interface TestItemInterface {
  language: string;
  taskCount: number;
  taskFullTime: number;
  uuid: string;
}

export interface TestInterfaceQuiz {
  count: number;
  tests: TestItemInterfaceQuiz[];
}

export interface TestItemInterfaceQuiz {
  name: string;
  language: string;
  uuid: string;
  taskCount: number;
  taskFullTime: number;
  questions: IQuizTestResponse[];
}
