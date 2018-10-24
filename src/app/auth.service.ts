import { Injectable } from '@angular/core';

import { environment } from '../environments/environment';

@Injectable()
export class AuthService {

  saveToken(token: string) {
    localStorage.setItem('loginToken', token);
  }

  getToken(): string {
    return localStorage.getItem('loginToken') || environment.devAuthToken;
  }

  hasToken(): boolean {
    return !!localStorage.getItem('loginToken');
  }
}
