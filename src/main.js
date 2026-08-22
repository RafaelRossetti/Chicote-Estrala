import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false, // Desativado para remover as caixas/linhas rosas de debug
            gravity: { y: 0 }
        }
    },
    scene: [BootScene, GameScene]
};

export default new Phaser.Game(config);
