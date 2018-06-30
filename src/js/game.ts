import 'phaser';
import * as LOG from 'loglevel';

import { LoadScene } from './scenes/LoadScene';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

if (DEV) {
  // Development configs
  LOG.setLevel('debug');
  LOG.info('Bestia Client is running in DEVELOPMENT MODE');
} else {
  // Production configs
  LOG.setLevel('warn');
}

const title = (DEV) ? 'Bestia Client DEVELOPMENT' : 'Bestia Client';

const config: GameConfig = {
  title: title,
  url: 'https://bestia-game.net',
  version: '0.1-alpha',
  width: 800,
  height: 600,
  zoom: 1,
  type: Phaser.AUTO,
  parent: 'game',
  scene: [BootScene, GameScene, LoadScene],
  input: {
    keyboard: true,
    mouse: true,
    touch: false,
    gamepad: false
  },
  backgroundColor: '#8abbc1',
  pixelArt: true,
  antialias: false
};

class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

window.onload = () => {
  const game = new Game(config);
};
