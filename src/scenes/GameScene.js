import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        const worldWidth = 4000;
        const worldHeight = 4000;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Chão da Caatinga usando o novo terreno.png
        this.ground = this.add.tileSprite(worldWidth/2, worldHeight/2, worldWidth, worldHeight, 'ground');

        this.player = new Player(this, worldWidth/2, worldHeight/2);
        
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
        this.drops = this.physics.add.group({ runChildUpdate: true });
        this.projectiles = this.physics.add.group({ runChildUpdate: true });

        // Colisões do Chicote, Projéteis e Inimigos
        this.physics.add.overlap(this.player.whipSprite, this.enemies, this.handleWhipHit, null, this);
        this.physics.add.overlap(this.projectiles, this.enemies, this.handleProjectileHit, null, this);
        this.physics.add.collider(this.player, this.enemies, this.handleEnemyTouch, null, this);
        this.physics.add.overlap(this.player, this.drops, this.handleCollectDrop, null, this);
        
        this.gameTime = 0;
        this.isLevelUpActive = false;
        this.currentWave = 1;
        this.regularSpawnCount = 0; // Contador de spawns para o ciclo de a cada 3 inimigos

        // Timer principal do jogo
        this.time.addEvent({
            delay: 1000,
            callback: () => { 
                if (!this.isLevelUpActive) {
                    this.gameTime++;
                    this.checkWaveAndBossEvents();
                    
                    // Aumento da taxa de spawn em 1% por segundo
                    const baseSpawnDelay = 1400;
                    const newSpawnDelay = Math.max(120, Math.floor(baseSpawnDelay * Math.pow(0.99, this.gameTime)));
                    this.spawnEvent.delay = newSpawnDelay;
                }
            },
            callbackScope: this,
            loop: true
        });

        // Loop de Spawn de Inimigos
        this.spawnEvent = this.time.addEvent({
            delay: 1400,
            callback: () => {
                if (!this.isLevelUpActive) this.spawnWaveEnemy();
            },
            callbackScope: this,
            loop: true
        });

        // HUD Fixa na Câmera
        this.uiText = this.add.text(20, 20, '', {
            fontSize: '15px',
            fontFamily: 'monospace',
            fill: '#fceabb',
            backgroundColor: '#1f140edd',
            padding: { x: 12, y: 10 }
        }).setScrollFactor(0).setDepth(100);

        this.events.on('levelUp', this.showLevelUpMenu, this);
    }

    update(time, delta) {
        if (this.isLevelUpActive) return;

        this.player.update(time, delta);
        
        const pickupRadius = 150;
        this.drops.getChildren().forEach(drop => {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, drop.x, drop.y);
            if (dist < pickupRadius) {
                this.physics.moveToObject(drop, this.player, 260);
            }
        });

        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const livesDisplay = '❤️ '.repeat(this.player.hp) + '🖤 '.repeat(Math.max(0, this.player.maxHp - this.player.hp));
        const spawnRatePercent = Math.floor((1400 / this.spawnEvent.delay) * 100);

        this.uiText.setText(`🌵 ONDA: ${this.currentWave}/5 | TEMPO: ${timeString} (Horda: ${spawnRatePercent}%)\n⭐ NÍVEL: ${this.player.level} (XP: ${this.player.xp}/${this.player.xpToNextLevel})\nHP: ${livesDisplay}`);
    }

    checkWaveAndBossEvents() {
        const newWave = Math.min(5, Math.floor(this.gameTime / 60) + 1);
        if (newWave !== this.currentWave) {
            this.currentWave = newWave;
        }

        // Spawns Oficiais de Bosses a cada 1 minuto
        if (this.gameTime === 60) {
            this.spawnBoss('boss1', '⚡ ALERTA: TRICERATOPS CORONEL CHEGOU! ⚡');
        } else if (this.gameTime === 120) {
            this.spawnBoss('boss2', '⚡ ALERTA: CARCARÁ VOADOR APARECEU! ⚡');
        } else if (this.gameTime === 180) {
            this.spawnBoss('boss3', '⚡ ALERTA: STEGOSAURUS CANGACEIRO! ⚡');
        } else if (this.gameTime === 240) {
            this.spawnBoss('boss4', '⚡ ALERTA: T-REX DE CAPA VERMELHA! ⚡');
        } else if (this.gameTime === 300) {
            this.spawnBoss('grande_boss', '👑 ALERTA: O GRANDE BOSS CHEGOU! 👑');
        }
    }

    spawnWaveEnemy() {
        const distance = Phaser.Math.Between(450, 600);
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const spawnX = this.player.x + Math.cos(angle) * distance;
        const spawnY = this.player.y + Math.sin(angle) * distance;

        this.regularSpawnCount++;

        // Após passar o 1º Boss (gameTime >= 60s), a cada 3 spawns surge 1 Boss anterior no meio da horda!
        let type = 'lizard';

        if (this.gameTime >= 60 && this.regularSpawnCount % 3 === 0) {
            const availableBosses = ['boss1'];
            if (this.gameTime >= 120) availableBosses.push('boss2');
            if (this.gameTime >= 180) availableBosses.push('boss3');
            if (this.gameTime >= 240) availableBosses.push('boss4');

            type = Phaser.Utils.Array.GetRandom(availableBosses);
        } else {
            // Spawn de inimigos normais (Calangos e Cangaceiros)
            if (this.currentWave >= 3 && Math.random() > 0.6) {
                type = 'cangaceiro';
            }
        }

        const enemy = new Enemy(this, spawnX, spawnY, type);
        this.enemies.add(enemy);
    }

    spawnBoss(bossType, alertMessage) {
        const distance = 550;
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const spawnX = this.player.x + Math.cos(angle) * distance;
        const spawnY = this.player.y + Math.sin(angle) * distance;

        const boss = new Enemy(this, spawnX, spawnY, bossType);
        this.enemies.add(boss);

        const alertText = this.add.text(400, 150, alertMessage, {
            fontSize: '22px',
            fontFamily: 'monospace',
            fill: '#ff3333',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.tweens.add({
            targets: alertText,
            scaleX: 1.2,
            scaleY: 1.2,
            yoyo: true,
            repeat: 3,
            duration: 300,
            onComplete: () => alertText.destroy()
        });
    }

    handleWhipHit(whipSprite, enemy) {
        if (!enemy.getData('hitByWhipTime') || this.time.now > enemy.getData('hitByWhipTime') + 220) {
            enemy.setData('hitByWhipTime', this.time.now);
            const damage = this.player.getWhipDamage();
            enemy.takeDamage(damage, this.player);

            this.showFloatingDamage(enemy.x, enemy.y, damage, '#ffea00');
        }
    }

    handleProjectileHit(projectile, enemy) {
        if (!projectile.active || !enemy.active) return;
        
        projectile.onHitEnemy(enemy);
        this.showFloatingDamage(enemy.x, enemy.y, projectile.damage, '#00e5ff');
    }

    handleEnemyTouch(player, enemy) {
        if (!this.isLevelUpActive) {
            player.takeDamage(enemy.damageLives);
        }
    }

    handleCollectDrop(player, drop) {
        if (drop.dropType === 'xp') {
            player.gainXp(drop.value);
            
            const xpText = this.add.text(player.x, player.y - 15, `+${drop.value} XP`, {
                fontSize: '14px',
                fontFamily: 'monospace',
                fill: '#55ff55',
                stroke: '#000',
                strokeThickness: 2
            }).setDepth(50);

            this.tweens.add({
                targets: xpText,
                y: player.y - 40,
                alpha: 0,
                duration: 500,
                onComplete: () => xpText.destroy()
            });
        }
        drop.destroy();
    }

    showFloatingDamage(x, y, damage, color = '#ffffff') {
        const dmgText = this.add.text(x, y - 20, `-${damage}`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            fill: color,
            stroke: '#000000',
            strokeThickness: 3
        }).setDepth(50);

        this.tweens.add({
            targets: dmgText,
            y: y - 50,
            alpha: 0,
            duration: 500,
            onComplete: () => dmgText.destroy()
        });
    }

    showLevelUpMenu() {
        this.isLevelUpActive = true;
        this.physics.pause();
        
        const cx = 400;
        const cy = 300;

        const bg = this.add.rectangle(cx, cy, 560, 380, 0x1f140e, 0.96)
            .setScrollFactor(0)
            .setDepth(1000)
            .setStrokeStyle(4, 0xd4a359);

        const titleText = this.add.text(cx, cy - 145, '⚡ NOVO NÍVEL ALCANÇADO! ⚡', {
            fontSize: '22px',
            fontFamily: 'monospace',
            fill: '#fceabb'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        const pool = [];

        if (this.player.whipLevel < 6) {
            pool.push({
                text: `🪢 Chicote de Couro (Nível ${this.player.whipLevel + 1})`,
                subText: '+Dano e velocidade de estalo',
                action: () => { this.player.whipLevel++; }
            });
        }

        if (this.player.pingaLevel < 6) {
            const nextLvl = this.player.pingaLevel + 1;
            pool.push({
                text: `🍾 Garrafa de Pinga ${this.player.pingaLevel === 0 ? '(NOVA ARMA!)' : `(Nível ${nextLvl})`}`,
                subText: 'Garrafa giratória orbital que causa dano contínuo',
                action: () => { this.player.pingaLevel++; }
            });
        }

        if (this.player.ferraduraLevel < 6) {
            const nextLvl = this.player.ferraduraLevel + 1;
            pool.push({
                text: `🧲 Ferradura Voadora ${this.player.ferraduraLevel === 0 ? '(NOVA ARMA!)' : `(Nível ${nextLvl})`}`,
                subText: 'Projétil a longa distância que rebate na tela',
                action: () => { this.player.ferraduraLevel++; }
            });
        }

        if (this.player.hp < this.player.maxHp) {
            pool.push({
                text: '❤️ Recuperar Vida (+1 Vida)',
                subText: 'Recupera 1 ponto de vida perdido',
                action: () => { this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1); }
            });
        }

        pool.push({
            text: '👟 Agilidade Sertaneja (+25 Velocidade)',
            subText: 'Aumenta a velocidade de movimento do peão',
            action: () => { this.player.speed += 25; }
        });

        Phaser.Utils.Array.Shuffle(pool);
        const choices = pool.slice(0, 3);
        
        const modalGroup = [bg, titleText];

        choices.forEach((choice, index) => {
            const btnY = cy - 50 + (index * 72);
            
            const btnBg = this.add.rectangle(cx, btnY, 500, 56, 0x3d271d)
                .setScrollFactor(0)
                .setDepth(1001)
                .setInteractive({ useHandCursor: true });

            btnBg.setStrokeStyle(2, 0x8c5e34);

            const btnTitle = this.add.text(cx, btnY - 8, choice.text, {
                fontSize: '16px',
                fontFamily: 'monospace',
                fill: '#ffffff'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

            const btnSub = this.add.text(cx, btnY + 12, choice.subText, {
                fontSize: '12px',
                fontFamily: 'monospace',
                fill: '#d4a359'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
            
            modalGroup.push(btnBg, btnTitle, btnSub);

            btnBg.on('pointerdown', () => {
                choice.action();
                modalGroup.forEach(el => el.destroy());
                this.physics.resume();
                this.isLevelUpActive = false;
            });
            
            btnBg.on('pointerover', () => {
                btnBg.setFillStyle(0x5c3b2c);
                btnBg.setStrokeStyle(2, 0xfceabb);
            });
            btnBg.on('pointerout', () => {
                btnBg.setFillStyle(0x3d271d);
                btnBg.setStrokeStyle(2, 0x8c5e34);
            });
        });
    }
}
