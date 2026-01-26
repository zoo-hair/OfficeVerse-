/*
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import Game from './game/Game.js';

window.onload = () => {
  new Game();
}; 
*/


import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.esm.js';
import BootScene from './game/scenes/BootScene.js';
import OfficeScene from './game/scenes/OfficeScene.js';
import UIScene from './game/scenes/UIScene.js';

const config = {
    
    type: Phaser.AUTO,
    width: 900, //640
    height: 600, //480*/
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [BootScene, OfficeScene, UIScene]  // [OfficeScene]
};

const game = new Phaser.Game(config);
