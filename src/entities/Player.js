import Phaser from 'phaser';
import Projectile from './Projectile.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player_sheet', 0);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.body.setSize(28, 44);
        this.body.setOffset(10, 16);
        
        this.speed = 160;

        // Vidas do jogador (Máximo 5 Vidas)
        this.hp = 5;
        this.maxHp = 5;
        
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 50;

        // Níveis das Armas (1 a 6)
        this.whipLevel = 1;      // Chicote de Couro
        this.pingaLevel = 0;     // Garrafa de Pinga (Orbital)
        this.ferraduraLevel = 0; // Ferradura Voadora (Projétil Quicante)

        this.lastWhipTime = 0;
        this.lastFerraduraTime = 0;
        this.facingRight = true;

        this.cursors = scene.input.keyboard.createCursorKeys();

        // Sprite visual do chicote
        this.whipSprite = scene.add.sprite(0, 0, 'whip');
        scene.physics.add.existing(this.whipSprite);
        this.whipSprite.body.setAllowGravity(false);
        this.whipSprite.body.setCircle(35);
        this.whipSprite.setVisible(false);
        this.whipSprite.body.enable = false;

        // Grupo de Garrafas de Pinga Orbitais
        this.pingaSprites = [];
        this.pingaAngle = 0;

        this.play('player-idle');
    }

    update(time, delta) {
        if (this.scene.isLevelUpActive) return;

        let isMoving = false;
        this.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.setVelocityX(-this.speed);
            this.facingRight = false;
            this.setFlipX(true);
            isMoving = true;
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(this.speed);
            this.facingRight = true;
            this.setFlipX(false);
            isMoving = true;
        }

        if (this.cursors.up.isDown) {
            this.setVelocityY(-this.speed);
            isMoving = true;
        } else if (this.cursors.down.isDown) {
            this.setVelocityY(this.speed);
            isMoving = true;
        }

        this.body.velocity.normalize().scale(this.speed);

        if (isMoving) {
            if (this.anims.currentAnim?.key !== 'player-walk') {
                this.play('player-walk');
            }
        } else {
            if (this.anims.currentAnim?.key !== 'player-idle') {
                this.play('player-idle');
            }
        }

        // 1. Lógica do Chicote
        const whipCooldown = Math.max(400, 1400 - (this.whipLevel * 150));
        if (time > this.lastWhipTime + whipCooldown) {
            this.attackWhip();
            this.lastWhipTime = time;
        }

        // 2. Lógica da Garrafa de Pinga
        if (this.pingaLevel > 0) {
            this.updatePinga(time, delta);
        }

        // 3. Lógica da Ferradura Voadora
        if (this.ferraduraLevel > 0) {
            const ferraduraCooldown = Math.max(800, 2400 - (this.ferraduraLevel * 250));
            if (time > this.lastFerraduraTime + ferraduraCooldown) {
                this.attackFerradura();
                this.lastFerraduraTime = time;
            }
        }
    }

    getClosestEnemy() {
        const enemies = this.scene.enemies.getChildren().filter(e => e.active);
        if (enemies.length === 0) return null;

        let closest = null;
        let minDistance = Infinity;

        enemies.forEach(enemy => {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (dist < minDistance) {
                minDistance = dist;
                closest = enemy;
            }
        });

        return minDistance <= 380 ? closest : null;
    }

    getWhipDamage() {
        return 15 + (this.whipLevel * 10);
    }

    attackWhip() {
        const target = this.getClosestEnemy();
        let angle = 0;

        if (target) {
            angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
            this.facingRight = target.x >= this.x;
            this.setFlipX(!this.facingRight);
        } else {
            angle = this.facingRight ? 0 : Math.PI;
        }

        const distanceOffset = 50;
        const whipX = this.x + Math.cos(angle) * distanceOffset;
        const whipY = this.y + Math.sin(angle) * distanceOffset;

        this.whipSprite.setPosition(whipX, whipY);
        this.whipSprite.setRotation(angle);
        this.whipSprite.setFlipY(!this.facingRight);

        const scale = 1.3 + (this.whipLevel * 0.1);
        this.whipSprite.setScale(scale);
        this.whipSprite.setVisible(true);
        this.whipSprite.body.enable = true;

        this.scene.time.delayedCall(180, () => {
            this.whipSprite.setVisible(false);
            this.whipSprite.body.enable = false;
        });

        if (this.whipLevel >= 4) {
            this.scene.time.delayedCall(220, () => {
                const oppositeAngle = angle + Math.PI;
                this.whipSprite.setPosition(this.x + Math.cos(oppositeAngle) * distanceOffset, this.y + Math.sin(oppositeAngle) * distanceOffset);
                this.whipSprite.setRotation(oppositeAngle);
                this.whipSprite.setVisible(true);
                this.whipSprite.body.enable = true;

                this.scene.time.delayedCall(180, () => {
                    this.whipSprite.setVisible(false);
                    this.whipSprite.body.enable = false;
                });
            });
        }
    }

    updatePinga(time, delta) {
        const pingaCount = Math.min(6, this.pingaLevel);
        const radius = 80 + (this.pingaLevel * 5);
        const rotationSpeed = 0.003 + (this.pingaLevel * 0.0008);

        this.pingaAngle += rotationSpeed * delta;

        while (this.pingaSprites.length < pingaCount) {
            const spr = this.scene.physics.add.sprite(this.x, this.y, 'pinga');
            spr.body.setAllowGravity(false);
            spr.body.setCircle(16);
            spr.setScale(1.2);
            this.pingaSprites.push(spr);
            
            this.scene.physics.add.overlap(spr, this.scene.enemies, (pingaSpr, enemy) => {
                if (!enemy.getData(`pingaHit_${pingaSpr.id}`) || time > enemy.getData(`pingaHit_${pingaSpr.id}`) + 400) {
                    enemy.setData(`pingaHit_${pingaSpr.id}`, time);
                    const damage = 12 + (this.pingaLevel * 6);
                    enemy.takeDamage(damage, this);
                }
            }, null, this);
        }

        const step = (Math.PI * 2) / pingaCount;
        for (let i = 0; i < pingaCount; i++) {
            const spr = this.pingaSprites[i];
            spr.id = i;
            const currentAngle = this.pingaAngle + (i * step);
            spr.setPosition(this.x + Math.cos(currentAngle) * radius, this.y + Math.sin(currentAngle) * radius);
            spr.rotation += 0.05;
        }
    }

    attackFerradura() {
        const count = 1 + Math.floor((this.ferraduraLevel - 1) / 2);
        const damage = 25 + (this.ferraduraLevel * 8);
        const speed = 300 + (this.ferraduraLevel * 30);
        const bounces = 3 + this.ferraduraLevel;

        const target = this.getClosestEnemy();
        let baseAngle = target ? Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) : Math.random() * Math.PI * 2;

        for (let i = 0; i < count; i++) {
            const spreadAngle = baseAngle + ((i - (count - 1) / 2) * 0.3);
            const proj = new Projectile(this.scene, this.x, this.y, spreadAngle, speed, damage, bounces);
            this.scene.projectiles.add(proj);
        }
    }

    // --- SISTEMA DE DANO E VIDAS COM CAMERA SHAKE E PARTÍCULAS ---
    takeDamage(amountLives = 1) {
        if (this.isInvulnerable) return;

        this.hp = Math.max(0, this.hp - amountLives);
        this.isInvulnerable = true;
        this.setTint(0xff2222);

        // 1. Camera Shake ao ser atingido
        this.scene.cameras.main.shake(220, 0.015);

        // 2. Emissão de Partículas de Impacto/Sangue Vermelho
        this.createHitParticles();

        if (this.hp <= 0) {
            this.die();
        }

        this.scene.time.delayedCall(600, () => {
            this.isInvulnerable = false;
            this.clearTint();
        });
    }

    createHitParticles() {
        for (let i = 0; i < 16; i++) {
            const p = this.scene.add.rectangle(this.x, this.y, 5, 5, 0xff0000).setDepth(60);
            const angle = Math.random() * Math.PI * 2;
            const speed = Phaser.Math.Between(80, 220);
            
            this.scene.tweens.add({
                targets: p,
                x: this.x + Math.cos(angle) * speed * 0.3,
                y: this.y + Math.sin(angle) * speed * 0.3,
                alpha: 0,
                scaleX: 0.2,
                scaleY: 0.2,
                duration: 350,
                onComplete: () => p.destroy()
            });
        }
    }

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
        this.scene.events.emit('levelUp');
    }

    die() {
        this.pingaSprites.forEach(p => p.destroy());
        this.pingaSprites = [];
        this.scene.scene.restart();
    }
}
