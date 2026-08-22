import Phaser from 'phaser';
import Drop from './Drop.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'lizard') {
        let textureKey = 'enemy_lizard';
        let animKey = 'enemy-lizard-anim';

        if (type === 'cangaceiro') {
            textureKey = 'enemy_sheet';
            animKey = 'enemy-cangaceiro';
        } else if (type === 'boss1') {
            textureKey = 'boss1_sheet';
            animKey = 'boss1-anim';
        } else if (type === 'boss2') {
            textureKey = 'boss2_sheet';
            animKey = 'boss2-anim';
        } else if (type === 'boss3') {
            textureKey = 'boss3_sheet';
            animKey = 'boss3-anim';
        } else if (type === 'boss4') {
            textureKey = 'boss4_sheet';
            animKey = 'boss4-anim';
        } else if (type === 'grande_boss') {
            textureKey = 'grande_boss_sheet';
            animKey = 'grande-boss-anim';
        }

        super(scene, x, y, textureKey, 0);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.enemyType = type;
        this.playerTarget = scene.player;

        this.play(animKey);

        const bossSpeed = 144; // 10% mais lento que o jogador (160 * 0.9)

        if (type === 'lizard') { // Inimigo Base (Base.png Raptor/Calango)
            this.body.setSize(36, 44);
            this.body.setOffset(14, 16);
            this.hp = 30;
            this.speed = 100;
            this.damageLives = 1;
            this.xpValue = 12;
            this.isBoss = false;
        } else if (type === 'cangaceiro') {
            this.body.setSize(30, 50);
            this.body.setOffset(13, 16);
            this.hp = 45;
            this.speed = 85;
            this.damageLives = 1;
            this.xpValue = 15;
            this.isBoss = false;
        } else if (type === 'boss1') { // Minuto 1: Triceratops
            this.setScale(1.3);
            this.body.setSize(60, 60);
            this.body.setOffset(18, 20);
            this.hp = 500;
            this.speed = bossSpeed;
            this.damageLives = 3;
            this.xpValue = 150;
            this.isBoss = true;
        } else if (type === 'boss2') { // Minuto 2: Carcará / Pterodactyl
            this.setScale(1.4);
            this.body.setSize(65, 65);
            this.body.setOffset(15, 15);
            this.hp = 850;
            this.speed = bossSpeed;
            this.damageLives = 3;
            this.xpValue = 250;
            this.isBoss = true;
        } else if (type === 'boss3') { // Minuto 3: Stegosaurus
            this.setScale(1.4);
            this.body.setSize(70, 70);
            this.body.setOffset(13, 13);
            this.hp = 1300;
            this.speed = bossSpeed;
            this.damageLives = 3;
            this.xpValue = 400;
            this.isBoss = true;
        } else if (type === 'boss4') { // Minuto 4: T-Rex
            this.setScale(1.5);
            this.body.setSize(75, 75);
            this.body.setOffset(10, 10);
            this.hp = 1800;
            this.speed = bossSpeed;
            this.damageLives = 3;
            this.xpValue = 600;
            this.isBoss = true;
        } else if (type === 'grande_boss') { // Minuto 5: O Grande Boss
            this.setScale(1.7);
            this.body.setSize(85, 95);
            this.body.setOffset(20, 20);
            this.hp = 3200;
            this.speed = bossSpeed;
            this.damageLives = 3;
            this.xpValue = 1500;
            this.isBoss = true;
        }
    }

    update() {
        if (!this.playerTarget || !this.active) return;
        
        this.scene.physics.moveToObject(this, this.playerTarget, this.speed);

        if (this.playerTarget.x < this.x) {
            this.setFlipX(true);
        } else {
            this.setFlipX(false);
        }
    }

    takeDamage(amount, knockbackSource = null) {
        this.hp -= amount;

        this.setTint(0xffffff);
        this.scene.time.delayedCall(120, () => {
            if (this.active) {
                this.clearTint();
                if (this.isBoss) {
                    this.setTint(0xff8888);
                }
            }
        });

        if (knockbackSource && !this.isBoss) {
            const angle = Phaser.Math.Angle.BetweenPoints(knockbackSource, this);
            const knockbackForce = 140;
            this.body.velocity.x = Math.cos(angle) * knockbackForce;
            this.body.velocity.y = Math.sin(angle) * knockbackForce;
            
            this.scene.time.delayedCall(150, () => {
                if (this.active) {
                    this.body.velocity.x = 0;
                    this.body.velocity.y = 0;
                }
            });
        }

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        if (this.isBoss) {
            const dropsCount = this.enemyType === 'grande_boss' ? 12 : 5;
            for (let i = 0; i < dropsCount; i++) {
                const drop = new Drop(this.scene, this.x + Phaser.Math.Between(-40, 40), this.y + Phaser.Math.Between(-40, 40), 'xp');
                drop.value = Math.floor(this.xpValue / dropsCount);
                this.scene.drops.add(drop);
            }
            const bossText = this.scene.add.text(this.x, this.y - 40, '☠️ BOSS DERROTADO! ☠️', {
                fontSize: '20px',
                fontFamily: 'monospace',
                fill: '#ffea00',
                stroke: '#000000',
                strokeThickness: 4
            }).setDepth(60);

            this.scene.tweens.add({
                targets: bossText,
                y: this.y - 90,
                alpha: 0,
                duration: 1200,
                onComplete: () => bossText.destroy()
            });
        } else {
            const drop = new Drop(this.scene, this.x, this.y, 'xp');
            drop.value = this.xpValue;
            this.scene.drops.add(drop);
        }
        
        this.destroy();
    }
}
