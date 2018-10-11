import { Injectable } from '@angular/core';

import { environment } from '../environments/environment';

@Injectable()
export class AuthService {

  saveToken(token: string) {
    localStorage.setItem('loginToken', token);
  }

  getToken(): string {
    const token = localStorage.getItem('loginToken') || environment.devAuthToken;

    return token;
  }
}
