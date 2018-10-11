import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

  saveToken(token: string) {
    localStorage.setItem('loginToken', token);
  }

  getToken(): string {
    return localStorage.getItem('loginToken');
  }
}
