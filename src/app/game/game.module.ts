import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PhaserModule } from 'phaser-component-library';

import { GameComponent } from './game.component';
import { ChatComponent } from './chat/chat.component';

import { WebSocketService } from './connection/websocket.service';
import { ChatService } from './chat/chat.service';
import { InventoryComponent } from './inventory/inventory.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  imports: [
    CommonModule,
    PhaserModule,
    FormsModule
  ],
  declarations: [
    GameComponent,
    ChatComponent,
    InventoryComponent,
    SettingsComponent
  ],
  providers: [
    WebSocketService,
    ChatService
  ]
})
export class GameModule { }
