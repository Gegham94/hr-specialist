import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ICompilerTestOutput, ICompilerTestRequest, ICompilerTestResponse } from "../../../shared/interfaces/compiler-tests.interface";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class CompilerService {
  constructor(private http: HttpClient) {}

  public getTestsById(testId: string): Observable<{data: ICompilerTestResponse[]} | null> {
    const fullUrl = `${environment.compilerTest}/compiler/tests`;
    return this.http.get<{data: ICompilerTestResponse[]}>(`${fullUrl}/${testId}`);
  }

  public applyTestbyId(code: string, testUuid: string): Observable<ICompilerTestOutput> {
    const fullUrl = `${environment.compilerTest}/compiler/compile`;
    return this.http.post<ICompilerTestOutput>(`${fullUrl}`, { code: code, uuid: testUuid });
  }

  public applyAllTests(tests: ICompilerTestRequest): Observable<ICompilerTestOutput> {
    const fullUrl = `${environment.compilerTest}/compiler/end-time`;
    return this.http.put<ICompilerTestOutput>(`${fullUrl}`, { tests: tests.tests });
  }
}
