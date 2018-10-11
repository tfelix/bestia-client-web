import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PhaserModule } from 'phaser-component-library';

import { WebSocketService } from './websocket.service';
import { GameComponent } from './game.component';

@NgModule({
  imports: [
    CommonModule,
    PhaserModule
  ],
  declarations: [
    GameComponent
  ],
  providers: [
    WebSocketService
  ]
})
export class GameModule { }
