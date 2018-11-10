import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { GameModule } from './game/game.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ModalComponent } from './modal.component';

import { AuthService } from './auth.service';
import { AuthGuardService } from './auth-guard.service';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    GameModule,
    FormsModule
  ],
  providers: [
    AuthService,
    AuthGuardService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
