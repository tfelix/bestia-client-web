import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import * as LOG from 'loglevel';

import { BootScene } from './scenes/BootScene';
import { LoadScene } from './scenes/LoadScene';
import { GameScene } from './scenes/GameScene';
import { UiScene } from './scenes/UiScene';
import { DialogModalPlugin } from './ui/DialogModalPlugin';

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

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // this.canvasDomRef.nativeElement.textContent = 'HelloWorld';
  }

  public onGameReady(game: Phaser.Game): void {
    // Dynamically add to Phaser our scene that utilizes Angular DI.
    this.game = game;
  }
}
