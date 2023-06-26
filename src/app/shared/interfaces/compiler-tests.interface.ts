export interface ICompilerTestRequest {
  tests: {
    code: string;
    testingTaskUuid: string;
  }[];
}

export interface ICompilerTestResponseSettings {
  remainingTime: string;
  remainingFixedTime: string;
  displayTestName: string;
  testsLengthCounter: number;
}

export interface ICompilerTestResponse {
  uuid: string;
  task: string;
  time: number;
  codeExample: string;
  success: boolean | null;
}

export interface ICompilerTestOutput {
  data: string;
  date: number;
  success: boolean;
}

export class CompilerTest implements ICompilerTestResponse {
  uuid!: string;
  task!: string;
  time!: number;
  codeExample!: string;
  index!: number;
  taskFullTime!: number;
  language!: string;
  currentExample!: string;
  monacoEditorKey!: string;
  test!: string;
  success!: boolean | null;

  constructor(compilerTestResponse: ICompilerTestResponse) {
    Object.assign(this, compilerTestResponse);
  }

  setIndex(index: number): this {
    this.index = index;
    return this;
  }

  setCurrentExample(code: string): this {
    this.currentExample = code;
    return this;
  }

  setTestSuccess(success: boolean | null): this {
    this.success = success;
    return this;
  }
}
