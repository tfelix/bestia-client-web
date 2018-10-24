import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  canActivate(): boolean {
    if (!this.hasAuthToken()) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }

  private hasAuthToken(): boolean {
    return this.authService.hasToken();
  }
}
