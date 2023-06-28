export interface ICompilerTestRequest {
  tests: {
    code: string;
    testingTaskUuid: string;
  }[];
}

export interface ICompilerTestsDb {
  id: number;
  data: CompilerTest[];
  settings: ICompilerTestSettings;
}

export interface ICompilerTestSettings {
  dateTimeTestStarted: Date;
  combinedTestTime: number;
}

export interface ICompilerTestResponse {
  uuid: string;
  task: string;
  time: number;
  codeExample: string;
  defaultName: string;
  ext: string;
  joinedName: string;
  monacoEditorKey: string;
  test: string;
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
  isFirst: boolean = false;
  isLast: boolean = false;
  defaultName!: string;
  ext!: string;
  joinedName!: string;
  result!: {
    success: boolean | null;
    resultMessage: string;
  };

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

  setPosition(index: number, lenght: number): this {
    this.isFirst = index === 0;
    this.isLast = index === lenght - 1;
    return this;
  }

  setResult(result: ICompilerTestOutput): this {
    this.result = {
      resultMessage: result.data || result.success ? "Success" : "Failure",
      success: result.success,
    };
    return this;
  }
}
