import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IQuizTestResponse } from 'src/app/shared/interfaces/quiz-tests.interface';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  constructor (private _httpClient: HttpClient) { }

  public applyTests(tests: IQuizTestResponse[]): Observable<IQuizTestResponse[]> {
    const fullUrl = `${environment.compilerTest}/quiz/send`;
    return this._httpClient.post<IQuizTestResponse[]>(`${fullUrl}`, { tests });
  }

}