import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PhaserModule } from 'phaser-component-library';

import { GameComponent } from './game.component';
import { ChatComponent } from './chat/chat.component';

import { WebSocketService } from './connection/websocket.service';
import { ChatService } from './chat/chat.service';
import { InventoryComponent } from './inventory/inventory.component';

@NgModule({
  imports: [
    CommonModule,
    PhaserModule
  ],
  declarations: [
    GameComponent,
    ChatComponent,
    InventoryComponent
  ],
  providers: [
    WebSocketService,
    ChatService
  ]
})
export class GameModule { }
