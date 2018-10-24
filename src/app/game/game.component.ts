import { Component, OnInit, ViewChild } from '@angular/core';

import * as PubSub from 'pubsub-js';

import { BootScene } from './scenes/BootScene';
import { LoadScene } from './scenes/LoadScene';
import { GameScene } from './scenes/GameScene';
import { IntroScene } from './scenes/IntroScene';
import { UiScene } from './scenes/UiScene';
import { DialogModalPlugin } from './ui/DialogModalPlugin';
import { WebSocketService } from './connection/websocket.service';
import { EngineEvents } from './message';
import { ChatComponent } from './chat/chat.component';
import { InventoryComponent } from './inventory/inventory.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  public componentVisibility = {
    chat: false,
    inventory: false
  };

  @ViewChild(ChatComponent)
  public chatComponent: ChatComponent;

  @ViewChild(InventoryComponent)
  public inventoryComponent: InventoryComponent;

  public hideDefaultCursorOverGame = true;

  public readonly config: GameConfig = {
    title: 'Test',
    url: 'https://bestia-game.net',
    version: '0.1.0-alpha',
    width: window.innerWidth,
    height: window.innerHeight,
    zoom: 1,
    type: Phaser.WEBGL,
    render: { pixelArt: true },
    parent: 'game',
    plugins: {
      scene: [{ key: 'UiScene', plugin: DialogModalPlugin, mapping: 'dialogModal' }]
    },
    scene: [BootScene, LoadScene, IntroScene, GameScene, UiScene],
    // scene: [IntroScene],
    input: {
      keyboard: true,
      mouse: true,
      touch: false,
      gamepad: false
    },
    backgroundColor: '#000000',
  };

  public game: Phaser.Game;

  constructor(
    private readonly websocketService: WebSocketService
  ) { }

  ngOnInit() {
    this.websocketService.connect();
  }

  public onGameReady(game: Phaser.Game): void {
    this.game = game;
    window.addEventListener('resize', () => this.resizeGameCanvas());
  }

  private resizeGameCanvas() {
    this.game.resize(window.innerWidth, window.innerHeight);
  }

  public onMouseOut() {
    if (this.hideDefaultCursorOverGame) {
      PubSub.publish(EngineEvents.GAME_MOUSE_OUT, null);
    }
  }

  public onMouseOver() {
    if (this.hideDefaultCursorOverGame) {
      PubSub.publish(EngineEvents.GAME_MOUSE_OVER, null);
    }
  }

  public toggleChat() {
    if (this.chatComponent.isOpen) {
      this.chatComponent.close();
    } else {
      this.inventoryComponent.close();
      this.chatComponent.open();
    }
  }

  public toggleInventory() {
    if (this.inventoryComponent.isOpen) {
      this.inventoryComponent.close();
    } else {
      this.chatComponent.close();
      this.inventoryComponent.open();
    }
  }
}
