import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { ICompilerTestOutput, ICompilerTestRequest, ICompilerTestResponse } from "src/app/shared/interfaces/compiler-tests.interface";

@Injectable({
  providedIn: "root",
})
export class CompilerService {
  constructor(private http: HttpClient) {}

  public getTestsByLanguage(testId: string): Observable<{data: ICompilerTestResponse[]} | null> {
    const fullUrl = `${environment.compilerTest}/compiler/tests`;
    return this.http.get<{data: ICompilerTestResponse[]}>(`${fullUrl}/${testId}`);
  }

  public applyTestById(code: string, testUuid: string): Observable<ICompilerTestOutput> {
    const fullUrl = `${environment.compilerTest}/compiler/compile`;
    return this.http.post<ICompilerTestOutput>(`${fullUrl}`, { code: code, uuid: testUuid });
  }

  public applyAllTests(tests: ICompilerTestRequest): Observable<boolean> {
    const fullUrl = `${environment.compilerTest}/compiler/end-time`;
    return this.http.put<boolean>(`${fullUrl}`, { tests: tests.tests });
  }
}
