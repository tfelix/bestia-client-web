import { Component, OnInit } from '@angular/core';

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
export class GameComponent implements OnInit {

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

  public onGameReady(game: Phaser.Game): void {
    this.game = game;
    window.addEventListener('resize', () => this.resizeGameCanvas());
  }

  private resizeGameCanvas() {
    this.game.resize(window.innerWidth, window.innerHeight);
  }

  public onMouseOut() {
    PubSub.publish(EngineEvents.GAME_MOUSE_OUT, null);
  }

  public onMouseOver() {
    PubSub.publish(EngineEvents.GAME_MOUSE_OVER, null);
  }
}
