import { Component, OnInit, AfterViewInit } from '@angular/core';

import * as LOG from 'loglevel';

import { BootScene } from './scenes/BootScene';
import { LoadScene } from './scenes/LoadScene';
import { GameScene } from './scenes/GameScene';
import { UiScene } from './scenes/UiScene';
import { DialogModalPlugin } from './ui/DialogModalPlugin';
import { WebSocketService } from './connection/websocket.service';
import { EngineEvents } from './message';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, AfterViewInit {

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
      // TS sys no
      scene: [{ key: 'UiScene', plugin: DialogModalPlugin, mapping: 'dialogModal' }]
      // scene: [{ key: 'DialogModalPlugin', plugin: DialogModalPlugin, systemKey: 'dialogModal', sceneKey: 'dialogModal', start: true }]
    },
    scene: [BootScene, LoadScene, GameScene, UiScene],
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

  ngAfterViewInit() {
    // this.canvasDomRef.nativeElement.textContent = 'HelloWorld';
  }

  public onGameReady(game: Phaser.Game): void {
    // Dynamically add to Phaser our scene that utilizes Angular DI.
    this.game = game;
  }

  public onMouseOut() {
    PubSub.publish(EngineEvents.GAME_MOUSE_OUT, null);
  }

  public onMouseOver() {
    PubSub.publish(EngineEvents.GAME_MOUSE_OVER, null);
  }
}
