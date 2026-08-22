import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Spritesheets do Jogador e Inimigo Básico
        this.load.spritesheet('player_sheet', '/assets/sprites/player_sheet.png', {
            frameWidth: 48,
            frameHeight: 64
        });
        this.load.spritesheet('enemy_sheet', '/assets/sprites/enemy_sheet.png', {
            frameWidth: 56,
            frameHeight: 72
        });
        this.load.spritesheet('enemy_lizard', '/assets/sprites/enemy_lizard.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // Spritesheets dos Bosses
        this.load.spritesheet('boss1_sheet', '/assets/sprites/boss1_sheet.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('boss2_sheet', '/assets/sprites/boss2_sheet.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('boss3_sheet', '/assets/sprites/boss3_sheet.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('boss4_sheet', '/assets/sprites/boss4_sheet.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('grande_boss_sheet', '/assets/sprites/grande_boss_sheet.png', { frameWidth: 128, frameHeight: 128 });

        // Armas, Terreno e Drops
        this.load.image('rapadura', '/assets/sprites/rapadura.png');
        this.load.image('whip', '/assets/sprites/whip.png');
        this.load.image('pinga', '/assets/sprites/pinga.png');
        this.load.image('ferradura', '/assets/sprites/ferradura.png');
        this.load.image('ground', '/assets/sprites/terreno.png');
    }

    create() {
        // Animações do Player
        this.anims.create({
            key: 'player-idle',
            frames: this.anims.generateFrameNumbers('player_sheet', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'player-walk',
            frames: this.anims.generateFrameNumbers('player_sheet', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        // Animação Inimigos Comuns
        this.anims.create({
            key: 'enemy-cangaceiro',
            frames: this.anims.generateFrameNumbers('enemy_sheet', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'enemy-lizard-anim',
            frames: this.anims.generateFrameNumbers('enemy_lizard', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        // Animações dos Bosses
        const makeBossAnim = (key, sheetKey) => {
            this.anims.create({
                key: key,
                frames: this.anims.generateFrameNumbers(sheetKey, { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1
            });
        };

        makeBossAnim('boss1-anim', 'boss1_sheet');
        makeBossAnim('boss2-anim', 'boss2_sheet');
        makeBossAnim('boss3-anim', 'boss3_sheet');
        makeBossAnim('boss4-anim', 'boss4_sheet');
        makeBossAnim('grande-boss-anim', 'grande_boss_sheet');

        this.scene.start('GameScene');
    }
}
