import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { PhaserModule } from 'phaser-component-library';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { ModalComponent } from './modal.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    LoginComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PhaserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
