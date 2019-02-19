import { Component, OnInit, ViewChild } from '@angular/core';

import * as PubSub from 'pubsub-js';

import { DialogModalPlugin } from './ui/DialogModalPlugin';
import { WebSocketService } from './connection/websocket.service';
import { EngineEvents } from './message';
import { ChatComponent } from './chat/chat.component';
import { InventoryComponent } from './inventory/inventory.component';
import { BootScene, LoadScene, IntroScene, GameScene, UiScene, WeatherScene, UiDialogScene } from './engine';
import { ServerEmulator } from './demo';
import { SettingsComponent } from './settings/settings.component';

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

  @ViewChild(SettingsComponent)
  public settingsComponent: SettingsComponent;

  public hasActiveGame = false;
  public hideDefaultCursorOverGame = false;

  private serverEmulator: ServerEmulator;

  // GameConfig type mapping key is broken
  public readonly config = {
    title: 'Bestia Browsergame',
    url: 'https://bestia-game.net',
    version: '0.1.0-alpha',
    width: window.innerWidth,
    height: window.innerHeight,
    zoom: 1,
    type: Phaser.WEBGL,
    render: { pixelArt: true },
    physics: {
      default: 'arcade',
      arcade: { debug: false }
    },
    parent: 'game',
    plugins: {
      scene: [{
        key: 'UiScenePlugin',
        plugin: DialogModalPlugin,
        systemKey: 'uiScenePlugin',
        sceneKey: 'dialogModal',
        mapping: 'dialogModal'
      }]
    },
    scene: [
      BootScene, LoadScene, IntroScene, GameScene, WeatherScene,
      UiDialogScene, UiScene
    ],
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
  ) {
    PubSub.subscribe(EngineEvents.GAME_READY, (_, isReady) => {
      this.hasActiveGame = isReady;
      this.hideDefaultCursorOverGame = true;

      this.serverEmulator = new ServerEmulator(this.game);
      this.serverEmulator.start();
    });
  }

  ngOnInit() {
    this.websocketService.connect();
  }

  public onGameReady(game: Phaser.Game): void {
    this.game = game;

    // Currently disabled as this reduces render quality. Need something better.
    /*
    window.addEventListener('resize', () => {
      game.resize(window.innerWidth, window.innerHeight);
    }, false);
    */
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

  public toggleSettings() {
    if (this.settingsComponent.isOpen) {
      this.settingsComponent.close();
    } else {
      this.chatComponent.close();
      this.inventoryComponent.close();
      this.settingsComponent.open();
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
