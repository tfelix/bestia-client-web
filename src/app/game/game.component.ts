import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

// import * as Phaser from 'phaser';
import * as LOG from 'loglevel';

import { LoadScene, BootScene, GameScene, UiScene } from './scenes';
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
      // mapping: 'dialogModal'
      scene: [{ key: 'dialogModal', plugin: DialogModalPlugin }]
    },
    scene: [BootScene, GameScene, LoadScene, UiScene],
    input: {
      keyboard: true,
      mouse: true,
      touch: false,
      gamepad: false
    },
    backgroundColor: '#000000',
  };

  public readonly phaser = Phaser;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // this.canvasDomRef.nativeElement.textContent = 'HelloWorld';
    alert('geht');
  }

  private resizeGame() {
    // this.game.resize(window.innerWidth, window.innerHeight);
  }

  public onGameReady(game): void {
    // Dynamically add to Phaser our scene that utilizes Angular DI.
    // game.scene.add('Scene', GameScene, true);
  }
}
