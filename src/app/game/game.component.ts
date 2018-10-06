import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import 'phaser';
import * as LOG from 'loglevel';

import { LoadScene, BootScene, GameScene, UiScene } from './scenes';
import { DialogModalPlugin } from './ui/DialogModalPlugin';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, AfterViewInit {

  private game: Phaser.Game;

  @ViewChild('gameCanvas', {read: ElementRef})
  private canvasDomRef: ElementRef;

  constructor() { }

  ngOnInit() {

    if (DEV) {
      // Development configs
      LOG.setLevel('debug');
      LOG.info('Bestia Client is running in DEVELOPMENT MODE');
    } else {
      // Production configs
      LOG.setLevel('warn');
    }

    const title = (DEV) ? 'Bestia Client DEVELOPMENT' : 'Bestia Client';
    const bestiaGameConfig: GameConfig = {
      title: title,
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
    this.game = new Phaser.Game(bestiaGameConfig);
  }

  ngAfterViewInit() {
    // this.canvasDomRef.nativeElement.textContent = 'HelloWorld';
    alert('geht');
  }

  private resizeGame() {
    // this.game.resize(window.innerWidth, window.innerHeight);
  }
}
